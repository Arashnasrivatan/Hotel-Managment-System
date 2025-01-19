const { Room, RoomImages } = require("./../db");
const response = require("./../utils/response");
const sharp = require("sharp");
const path = require("path");

exports.getRooms = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const {
      room_number,
      floor,
      room_type,
      capacity,
      price_per_night,
      amenities,
    } = req.body;

    const amenities_string = JSON.parse(amenities).toString();

    if (!req.files || req.files.length === 0) {
      return response(res, 400, "حداقل یک عکس باید برای اتاق آپلود شود");
    }
    const isRoomNumberExist = await Room.findOne({
      where: { room_number },
    });
    if (isRoomNumberExist) {
      return response(res, 400, "شماره اتاق وارد شده تکراری است");
    }

    const newRoom = await Room.create(
      {
        room_number,
        floor,
        room_type,
        capacity,
        price_per_night,
        amenities: amenities_string,
      },
      { raw: true }
    );

    const uploadDir = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "images",
      "rooms"
    );
    let images = [];

    req.files.forEach(async (file) => {
      try {
        const fileBuffer = file.buffer;
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        images.push(`/images/rooms/${fileName}`);

        await sharp(fileBuffer).png({ quality: 50 }).toFile(filePath);

        await RoomImages.create({
          room_id: newRoom.dataValues.id,
          image_path: `/images/rooms/${fileName}`,
        });
      } catch (err) {
        console.error("Error processing image:", err);
        return response(res, 500, "خطایی در پردازش تصاویر رخ داده است");
      }
    });

    const formattedRoom = {
      ...newRoom.dataValues,
      images,
    };

    return response(res, 201, "اتاق با موفقیت اضافه شد", formattedRoom);
  } catch (err) {
    next(err);
  }
};
