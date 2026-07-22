# ⚡ ApexScale AI - Ultra HD Media Upscaler (Streamlit Edition)
**Developed by Furqan**

An AI-Powered Low-Resolution to 4K/8K Media Quality Enhancer built with Python, Streamlit, OpenCV, and Gemini AI.

---

## 🚀 How to Run Locally with Streamlit

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Configure your Gemini API Key**:
Option A: Create a `.streamlit/secrets.toml` file with:
```toml
GEMINI_API_KEY = "your_gemini_api_key_here"
```
Option B: Pass it in the application sidebar at runtime.

3. **Launch the App**:
```bash
streamlit run app.py
```

---

## ☁️ How to Deploy on Streamlit Community Cloud (Free)

1. Push this project to your GitHub repository:
```bash
git init
git add .
git commit -m "Initial Streamlit commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/apexscale-ai-upscaler.git
git push -u origin main
```

2. Go to [share.streamlit.io](https://share.streamlit.io) and log in with GitHub.
3. Click **New App**, select your repo `apexscale-ai-upscaler` and main file `app.py`.
4. Under **Advanced Settings -> Secrets**, add:
```toml
GEMINI_API_KEY = "your_actual_gemini_api_key"
```
5. Click **Deploy!** 🎉

---

*Developed with ❤️ by Furqan*
