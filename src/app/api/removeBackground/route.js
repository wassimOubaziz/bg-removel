import fs from "fs";
import path from "path";
import { exec } from "child_process";

const removeBackground = async (imagePath, outputFilePath) => {
  const command = `python ${path.join(
    process.cwd(),
    "removebg.py"
  )} ${imagePath} ${outputFilePath}`;
  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        return reject(error);
      }
      resolve(outputFilePath);
    });
  });
};

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("image");

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
    });
  }

  const tempInputPath = path.join(process.cwd(), "public/tempImage.png");
  const outputFilePath = path.join(process.cwd(), "public/output.png");

  // Save the uploaded image temporarily
  const buffer = await file.arrayBuffer();
  fs.writeFileSync(tempInputPath, Buffer.from(buffer));

  try {
    await removeBackground(tempInputPath, outputFilePath);
    return new Response(JSON.stringify({ outputImage: `/output.png` }), {
      status: 200,
    });
  } catch (error) {
    console.error("Background removal error:", error);
    return new Response(
      JSON.stringify({ error: "Error removing background" }),
      { status: 500 }
    );
  } finally {
    // Clean up the temporary image
    fs.unlinkSync(tempInputPath);
  }
}
