import { Readable } from "stream";
import cloudinary from "./cloudinary.js";

export const uploadImage = (buffer, folder = "products") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    Readable.from(buffer).pipe(stream);
  });
