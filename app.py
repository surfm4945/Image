import streamlit as st
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageOps
import io
import time
import os
import json

# Try importing Google GenAI SDK for Gemini features
try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# =========================================================
# ApexScale AI - Auto-Professional Photo Editor & Super-Resolution
# Developed by Furqan
# =========================================================

st.set_page_config(
    page_title="Ai image changer",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Glassmorphic Dark Studio Theme
st.markdown("""
<style>
    .main {
        background: linear-gradient(135deg, #050507 0%, #0d1117 50%, #1a0b2e 100%);
        color: #e0e0e0;
        font-family: 'Inter', -apple-system, sans-serif;
    }
    .stButton>button {
        background: linear-gradient(135deg, #7000FF 0%, #00F2FF 100%);
        color: white;
        border-radius: 8px;
        font-weight: 600;
        border: none;
        padding: 0.65rem 1.75rem;
        box-shadow: 0 0 20px rgba(0, 242, 255, 0.35);
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 25px rgba(0, 242, 255, 0.6);
    }
    .auto-badge {
        background: linear-gradient(90deg, rgba(0, 242, 255, 0.15), rgba(112, 0, 255, 0.2));
        color: #00F2FF;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 1px;
        border: 1px solid rgba(0, 242, 255, 0.5);
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

# Header Section
st.title("")
st.markdown("### 🚀 **Developed by FURQAN**")
st.caption("Automatic AI Photo Enhancement.")

st.divider()

# =========================================================
# 🔑 API KEY & SECRETS CONFIGURATION
# =========================================================
gemini_api_key = None

if "GEMINI_API_KEY" in st.secrets:
    gemini_api_key = st.secrets["GEMINI_API_KEY"]
elif "GEMINI_API_KEY" in os.environ:
    gemini_api_key = os.environ["GEMINI_API_KEY"]

# Sidebar Controls
st.sidebar.header("🎛️ Auto Studio Settings")

if not gemini_api_key:
    st.sidebar.subheader("🔐 Gemini API Key")
    user_key_input = st.sidebar.text_input(
        "Enter Gemini API Key (or set in Streamlit Secrets):",
        type="password",
        help="Get your free key from Google AI Studio (https://aistudio.google.com/)"
    )
    if user_key_input:
        gemini_api_key = user_key_input
else:
    st.sidebar.success("✅ Gemini API Key loaded..")

# Auto Edit Mode Selector
auto_mode = st.sidebar.selectbox(
    "🪄 Auto Pro Edit Profile",
    [
        "✨ Smart Auto Pro (AI Analyzed)",
        "👤 Auto Portrait Studio (Smooth Skin + Pop Eyes)",
        "🌄 Auto Vibrant Landscape (Deep Sky & Foliage)",
        "🎬 Auto Cinematic Film Look (Teal & Orange)",
        "🌃 Auto Low-Light / Night Boost",
        "⚙️ Manual Tweaks Only"
    ]
)

upscale_factor = st.sidebar.radio("Target Resolution Preset", ["2x (Full HD 1080p)", "4x (Ultra HD 4K)", "8x (Extreme 8K)"])

with st.sidebar.expander("🛠️ Manual Overrides (Optional)", expanded=False):
    manual_sharpness = st.slider("Extra Edge Sharpness", 0, 100, 0)
    manual_denoise = st.slider("Extra Denoise", 0, 100, 0)
    manual_contrast = st.slider("Extra Contrast", -50, 50, 0)
    manual_vibrance = st.slider("Extra Vibrance", -50, 50, 0)

ai_analysis = st.sidebar.checkbox("AI Professional Edit Advice (Gemini)", value=True)

# =========================================================
# ⚙️ AUTOMATIC COMPUTER VISION PHOTO EDITING ENGINE
# =========================================================

def auto_white_balance(cv_img):
    """ Gray World assumption for automatic white balance correction """
    result = cv_img.astype(np.float32)
    avg_b = np.mean(result[:, :, 0])
    avg_g = np.mean(result[:, :, 1])
    avg_r = np.mean(result[:, :, 2])
    
    avg_gray = (avg_b + avg_g + avg_r) / 3.0
    if avg_b > 0 and avg_g > 0 and avg_r > 0:
        result[:, :, 0] = np.clip(result[:, :, 0] * (avg_gray / avg_b), 0, 255)
        result[:, :, 1] = np.clip(result[:, :, 1] * (avg_gray / avg_g), 0, 255)
        result[:, :, 2] = np.clip(result[:, :, 2] * (avg_gray / avg_r), 0, 255)
    return result.astype(np.uint8)

def auto_exposure_contrast(cv_img):
    """ Automatic CLAHE (Contrast Limited Adaptive Histogram Equalization) on LAB color space """
    lab = cv2.cvtColor(cv_img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # Adaptive histogram equalization for natural contrast
    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    
    limg = cv2.merge((cl, a, b))
    return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

def auto_unsharp_mask(cv_img, blur_score):
    """ Smart Unsharp Masking based on current image sharpness variance """
    # Less sharp images get stronger sharpening
    amount = 1.4 if blur_score < 100 else (1.0 if blur_score < 300 else 0.6)
    blurred = cv2.GaussianBlur(cv_img, (0, 0), 1.2)
    sharpened = cv2.addWeighted(cv_img, 1.0 + amount, blurred, -amount, 0)
    return np.clip(sharpened, 0, 255).astype(np.uint8)

def apply_auto_pro_pipeline(pil_img, profile_mode, scale_factor, override_sharp, override_denoise, override_contrast, override_vibrance):
    # Step 1: Resample & Upscale
    mult = 2
    if "4x" in scale_factor:
        mult = 4
    elif "8x" in scale_factor:
        mult = 8
        
    w, h = pil_img.size
    new_w, new_h = w * mult, h * mult
    
    upscaled_pil = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    cv_img = cv2.cvtColor(np.array(upscaled_pil), cv2.COLOR_RGB2BGR)
    
    # Calculate Blur Score (Laplacian Variance)
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    if profile_mode != "⚙️ Manual Tweaks Only":
        # 1. Automatic White Balance
        cv_img = auto_white_balance(cv_img)
        
        # 2. Automatic CLAHE Contrast & Exposure
        cv_img = auto_exposure_contrast(cv_img)
        
        # 3. Automatic Bilateral Denoise
        denoise_level = 35 if blur_score < 150 else 20
        cv_img = cv2.bilateralFilter(cv_img, 5, denoise_level, denoise_level)
        
        # 4. Smart Adaptive Unsharp Masking
        cv_img = auto_unsharp_mask(cv_img, blur_score)
        
    # Apply Profile specific grading
    img_float = cv_img.astype(np.float32) / 255.0
    
    if profile_mode == "👤 Auto Portrait Studio (Smooth Skin + Pop Eyes)":
        b, g, r = img_float[:, :, 0], img_float[:, :, 1], img_float[:, :, 2]
        r = np.clip(r * 1.08 + 0.02, 0, 1) # Skin tone warmth
        g = np.clip(g * 1.02, 0, 1)
        img_float = np.stack([b, g, r], axis=2)
        
    elif profile_mode == "🌄 Auto Vibrant Landscape (Deep Sky & Foliage)":
        b, g, r = img_float[:, :, 0], img_float[:, :, 1], img_float[:, :, 2]
        b = np.clip(b * 1.12 + 0.02, 0, 1) # Deep blue sky
        g = np.clip(g * 1.10, 0, 1)        # Green foliage
        r = np.clip(r * 1.05, 0, 1)
        img_float = np.stack([b, g, r], axis=2)
        
    elif profile_mode == "🎬 Auto Cinematic Film Look (Teal & Orange)":
        b, g, r = img_float[:, :, 0], img_float[:, :, 1], img_float[:, :, 2]
        r = np.clip(r * 1.15 + 0.04, 0, 1)
        b = np.clip(b * 1.10 + 0.06, 0, 1)
        g = np.clip(g * 0.95, 0, 1)
        img_float = np.stack([b, g, r], axis=2)
        
    elif profile_mode == "🌃 Auto Low-Light / Night Boost":
        # Lift shadows
        img_float = np.clip(np.power(img_float, 0.85) * 1.1, 0, 1)

    cv_img = (img_float * 255.0).astype(np.uint8)
    result_pil = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))
    
    # Apply optional manual overrides
    if override_sharp > 0:
        enh = ImageEnhance.Sharpness(result_pil)
        result_pil = enh.enhance(1.0 + override_sharp / 40.0)
        
    if override_vibrance != 0:
        enh = ImageEnhance.Color(result_pil)
        result_pil = enh.enhance(1.0 + override_vibrance / 50.0)
        
    if override_contrast != 0:
        enh = ImageEnhance.Contrast(result_pil)
        result_pil = enh.enhance(1.0 + override_contrast / 50.0)
        
    return result_pil, new_w, new_h, blur_score

# Gemini AI Analysis Helper
def analyze_image_with_gemini(pil_img, api_key):
    if not HAS_GENAI or not api_key:
        return "Provide a Gemini API Key in Streamlit Secrets or sidebar to enable AI analysis."
    try:
        client = genai.Client(api_key=api_key)
        prompt = (
            "Analyze this photo as an expert professional photographer and editor. "
            "Provide 3 bullet points: 1) Composition & Lighting review, "
            "2) Quality & sharpness assessment, 3) Auto-editing adjustments applied."
        )
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[pil_img, prompt]
        )
        return response.text
    except Exception as e:
        return f"Gemini Analysis Note: {str(e)}"

# Main File Upload Area
uploaded_files = st.file_uploader(
    "Choose low-res or raw photos",
    type=["jpg", "jpeg", "png", "webp"],
    accept_multiple_files=True
)

if uploaded_files:
    st.markdown(f'<span class="auto-badge">Auto Active: {auto_mode}</span>', unsafe_allow_html=True)
    st.subheader(f"🖼️ Auto-Processing({len(uploaded_files)} photos)")
    
    for idx, file in enumerate(uploaded_files):
        orig_img = Image.open(file)
        orig_w, orig_h = orig_img.size
        orig_mp = round((orig_w * orig_h) / 1_000_000, 2)
        
        tab1, tab2 = st.tabs(["📸 Side-by-Side Studio View", "🤖 Gemini AI Photo Review"])
        
        with tab1:
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("#### 🔴 Original Unedited Photo")
                st.image(orig_img, caption=f"Original ({orig_w}x{orig_h}px | {orig_mp} MP)", use_container_width=True)
                
            with col2:
                st.markdown(f"#### Auto-Edited & Upscaled")
                with st.spinner(f"Applying auto-color balance, CLAHE, and super-resolution..."):
                    start_t = time.time()
                    enhanced_img, new_w, new_h, blur_score = apply_auto_pro_pipeline(
                        orig_img, auto_mode, upscale_factor,
                        manual_sharpness, manual_denoise, manual_contrast, manual_vibrance
                    )
                    proc_time = round(time.time() - start_t, 2)
                    new_mp = round((new_w * new_h) / 1_000_000, 2)
                    
                st.image(enhanced_img, caption=f"⚡ Auto Pro Ultra HD ({new_w}x{new_h}px | {new_mp} MP) - {proc_time}s", use_container_width=True)
                
                buf = io.BytesIO()
                enhanced_img.save(buf, format="PNG")
                byte_im = buf.getvalue()
                
                st.download_button(
                    label=f"📥 Download({new_w}x{new_h}px - {new_mp} MP)",
                    data=byte_im,
                    file_name=f"auto_pro_{new_w}x{new_h}_{file.name}",
                    mime="image/png",
                    key=f"dl_auto_{idx}"
                )
                
        with tab2:
            if ai_analysis and gemini_api_key:
                with st.spinner("Analyzing image with Gemini 2.5 Flash AI Studio..."):
                    insights = analyze_image_with_gemini(orig_img, gemini_api_key)
                    st.info(insights)
            else:
                st.warning("Enable AI Image Quality Analysis...")
                
        st.divider()

else:
    st.info("👆 Upload low-res photoss..")

# Footer
st.markdown("---")
st.markdown(f"**Developed by Furqan**")
