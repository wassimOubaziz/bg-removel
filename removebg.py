import numpy as np
from PIL import Image
import torch
from torchvision import transforms
from u2net import utils, model

# Load the U^2-Net model
model_path = './ckpt/u2net.pth'
model_pred = model.U2NET(3, 1)
model_pred.load_state_dict(torch.load(model_path, map_location="cpu"))
model_pred.eval()

def norm_pred(d):
    ma = torch.max(d)
    mi = torch.min(d)
    dn = (d - mi) / (ma - mi)
    return dn

def preprocess(image):
    label_3 = np.zeros(image.shape)
    label = np.zeros(label_3.shape[0:2])

    if 3 == len(label_3.shape):
        label = label_3[:, :, 0]
    elif 2 == len(label_3.shape):
        label = label_3

    if 3 == len(image.shape) and 2 == len(label.shape):
        label = label[:, :, np.newaxis]
    elif 2 == len(image.shape) and 2 == len(label.shape):
        image = image[:, :, np.newaxis]
        label = label[:, :, np.newaxis]

    transform = transforms.Compose([utils.RescaleT(320), utils.ToTensorLab(flag=0)])
    sample = transform({"imidx": np.array([0]), "image": image, "label": label})

    return sample

def remove_background(input_image_path, output_image_path):
    image = Image.open(input_image_path).convert("RGB")
    sample = preprocess(np.array(image))

    with torch.no_grad():
        inputs_test = torch.FloatTensor(sample["image"].unsqueeze(0).float())
        d1, _, _, _, _, _, _ = model_pred(inputs_test)
        pred = d1[:, 0, :, :]
        predict = norm_pred(pred).squeeze().cpu().detach().numpy()
        img_out = Image.fromarray(predict * 255).convert("RGB")
        img_out = img_out.resize(image.size, resample=Image.BILINEAR)
        empty_img = Image.new("RGBA", image.size, 0)
        img_out = Image.composite(image, empty_img, img_out.convert("L"))

    img_out.save(output_image_path)

if __name__ == "__main__":
    import sys

    input_image_path = sys.argv[1]
    output_image_path = sys.argv[2]
    remove_background(input_image_path, output_image_path)
