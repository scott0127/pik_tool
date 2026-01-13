from PIL import Image
import os

try:
    input_path = r'c:\Users\scott\OneDrive\Desktop\pikmin\public\favicon.jpg'
    output_path = r'c:\Users\scott\OneDrive\Desktop\pikmin\public\favicon.ico'

    if not os.path.exists(input_path):
        print(f"Error: Could not find {input_path}")
        exit(1)

    img = Image.open(input_path)
    
    # Save as ICO with multiple sizes for best quality
    img.save(output_path, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    
    print(f"Success! Converted {input_path} to {output_path}")

except Exception as e:
    print(f"An error occurred: {e}")
