import numpy as np
import cv2


def preprocess_image(path, size=(256, 256)):
    img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"Image not found at path: {path}")

    img = cv2.resize(img, size)
    img = cv2.GaussianBlur(img, (5, 5), 0)

    _, thresh = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    return thresh


def extract_features(img):
    contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not contours:
        return None

    cnt = max(contours, key=cv2.contourArea)

    area = cv2.contourArea(cnt)
    perimeter = cv2.arcLength(cnt, True)

    circularity = (4 * np.pi * area) / (perimeter**2 + 1e-5)

    x, y, w, h = cv2.boundingRect(cnt)
    aspect_ratio = w / (h + 1e-5)

    hist = cv2.calcHist([img], [0], None, [256], [0, 256]).ravel()
    hist = hist[hist > 0] / hist.sum()
    entropy = -np.sum(hist * np.log2(hist + 1e-5))

    dist_transform = cv2.distanceTransform(img, cv2.DIST_L2, 5)
    pixels = dist_transform[dist_transform > 0]
    mean_thickness = np.mean(pixels) * 2 if len(pixels) > 0 else 0
    std_thickness = np.std(pixels) * 2 if len(pixels) > 0 else 0

    feats = [
        area,
        perimeter,
        circularity,
        aspect_ratio,
        entropy,
        mean_thickness,
        std_thickness,
    ]

    feats = [0 if (np.isnan(v) or np.isinf(v)) else v for v in feats]
    return feats
