import streamlit as st
import cv2
import numpy as np
from PIL import Image, ImageEnhance
import io
import time
import os

# Try importing Google GenAI SDK for Gemini features
try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# =========================================================
# ApexScale AI - Ultra HD Media Upscaler (Streamlit Edition)
# Developed by Furqan
# =========================================================

st.set_page_config(
    page_title="AI IMAGE RESULATION",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (Immersive Dark Theme)
st.markdown("""
<style>
    .main {
        background: linear-gradient(135deg, #050507 0%, #0d1117 50%, #1a0b2e 100%);
        color: #e0e0e0;
    }
    .stButton>button {
        background: linear-gradient(135deg, #7000FF 0%, #00F2FF 100%);
        color: white;
        border-radius: 8px;
        font-weight: 600;
        border: none;
        padding: 0.6rem 1.5rem;
        box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
    }
    .badge {
        background-color: rgba(255, 255, 255, 0.05);
        color: #00F2FF;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
        border: 1px solid rgba(0, 242, 255, 0.4);
    }
</style>
""", unsafe_allow_html=True)

# Header Section
st.title(" HIGH RESULATION ")
st.markdown("### 🚀 **Developed by FURQAN**")
st.caption("AI-Powered Low-Resolution to 4K/8K Media Quality Enhancer...")

st.divider()

# =========================================================
# 🔑 API KEY & SECRETS CONFIGURATION (Streamlit Secrets Support)
# =========================================================
gemini_api_key = None

if "GEMINI_API_KEY" in st.secrets:
    gemini_api_key = st.secrets["GEMINI_API_KEY"]
elif "GEMINI_API_KEY" in os.environ:
    gemini_api_key = os.environ["GEMINI_API_KEY"]

# Sidebar Controls
st.sidebar.header("🎛️ Upscale & Filter Controls")

# API Key fallback input in sidebar if not set in secrets
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
    st.sidebar.success("✅ Gemini API Key loaded...")

upscale_factor = st.sidebar.radio("Target Resolution Preset", ["Full HD 1080p", "Ultra HD 4K", "Extreme 8K"])
sharpness = st.sidebar.slider("Edge Sharpness", 0, 100, 60)
denoise = st.sidebar.slider("Denoise / Compression Artifact Removal", 0, 100, 40)
contrast = st.sidebar.slider("Contrast Enhancement", 0, 100, 30)
ai_analysis = st.sidebar.checkbox("AI Image Quality Analysis..", value=True)

# Super Resolution Processing Function
def upscale_and_enhance(pil_img, scale_factor, sharpness_val, denoise_val, contrast_val):
    mult = 2
    if "4x" in scale_factor:
        mult = 4
    elif "8x" in scale_factor:
        mult = 8
        
    w, h = pil_img.size
    new_w, new_h = w * mult, h * mult
    
    # High quality Lanczos resampling
    upscaled = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Sharpness
    if sharpness_val > 0:
        enhancer = ImageEnhance.Sharpness(upscaled)
        upscaled = enhancer.enhance(1.0 + (sharpness_val / 40.0))
        
    # Contrast
    if contrast_val > 0:
        enhancer = ImageEnhance.Contrast(upscaled)
        upscaled = enhancer.enhance(1.0 + (contrast_val / 100.0))
        
    # Denoise using OpenCV Bilateral Filter
    if denoise_val > 0:
        cv_img = cv2.cvtColor(np.array(upscaled), cv2.COLOR_RGB2BGR)
        d_val = int(5 + (denoise_val / 20))
        cv_img = cv2.bilateralFilter(cv_img, d_val, 75, 75)
        upscaled = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))
        
    return upscaled, new_w, new_h

# Gemini AI Analysis Helper
def analyze_image_with_gemini(pil_img, api_key):
    if not HAS_GENAI or not api_key:
        return "Provide a Gemini API Key in Streamlit Secrets or sidebar to enable AI analysis."
    try:
        client = genai.Client(api_key=api_key)
        prompt = "Analyze this image's sharpness, noise level, lighting, and suggested enhancement settings in 2-3 concise bullet points."
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[pil_img, prompt]
        )
        return response.text
    except Exception as e:
        return f"Gemini Analysis Note: {str(e)}"

# Main File Upload
uploaded_files = st.file_uploader(
    "Choose low-resolution images to upscale (Batch Support Enabled)",
    type=["jpg", "jpeg", "png", "webp"],
    accept_multiple_files=True
)

if uploaded_files:
    st.subheader(f"🖼️ Batch Processing Queue ({len(uploaded_files)} files)")
    
    for idx, file in enumerate(uploaded_files):
        col1, col2 = st.columns(2)
        
        orig_img = Image.open(file)
        orig_w, orig_h = orig_img.size
        
        with col1:
            st.image(orig_img, caption=f"Original ({orig_w}x{orig_h}px)", use_container_width=True)
            
            # AI Analysis block
            if ai_analysis and gemini_api_key:
                with st.expander("🤖 Gemini AI Quality Insights"):
                    with st.spinner("Analyzing image details..."):
                        insights = analyze_image_with_gemini(orig_img, gemini_api_key)
                        st.info(insights)
            
        with col2:
            with st.spinner(f"Enhancing file {idx+1}/{len(uploaded_files)} with AI..."):
                start_t = time.time()
                enhanced_img, new_w, new_h = upscale_and_enhance(
                    orig_img, upscale_factor, sharpness, denoise, contrast
                )
                proc_time = round(time.time() - start_t, 2)
                
            st.image(enhanced_img, caption=f"⚡ Upscaled ({new_w}x{new_h}px) - {proc_time}s", use_container_width=True)
            
            buf = io.BytesIO()
            enhanced_img.save(buf, format="PNG")
            byte_im = buf.getvalue()
            
            st.download_button(
                label=f"📥 Download High Res ({new_w}x{new_h}px)",
                data=byte_im,
                file_name=f"upscaled_{new_w}x{new_h}_{file.name}",
                mime="image/png",
                key=f"dl_{idx}"
            )
        st.divider()

else:
    st.info("👆 Upload one or more low-resolution photos..")

# Footer
st.markdown("---")
st.markdown("**Developed by Furqan**")
