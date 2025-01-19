const { Room, RoomImages } = require("./../db");
const response = require("./../utils/response");
const sharp = require("sharp");
const path = require("path");

exports.getRooms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const rooms = await Room.findAll({
      raw: true,
      offset,
      limit,
    });

    const roomCount = await Room.count();

    const roomsWithImages = await Promise.all(
      rooms.map(async (room) => {
        room.amenities = room.amenities.replace(/"/g, "");
        const roomImages = await RoomImages.findAll({
          where: { room_id: room.id },
          attributes: {
            exclude: ["room_id"],
          },
          raw: true,
        });
        room.images = roomImages;
        return room;
      })
    );

    return response(res, 200, "لیست اتاق ها با موفقیت گرفته شد", {
      roomCount,
      currentPage: page,
      totalPages: Math.ceil(roomCount / limit),
      rooms: roomsWithImages,
    });
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

exports.getRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id, {
      raw: true,
    });

    if (!room) {
      return response(res, 404, "اتاق با این شناسه یافت نشد");
    }

    const roomImages = await RoomImages.findAll({
      where: { room_id: id },
      attributes: {
        exclude: ["room_id"],
      },
      raw: true,
    });
    room.amenities = room.amenities.replace(/"/g, "");
    room.images = roomImages;

    return response(res, 200, "اتاق با موفقیت گرفته شد", room);
  } catch (err) {
    next(err);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { room_number, floor, room_type, capacity, price_per_night } =
      req.body;

    const { id } = req.params;

    const room = await Room.findByPk(id, {
      raw: true,
    });

    if (!room) {
      return response(res, 404, "اتاق با این شناسه یافت نشد");
    }

    if (room_number) {
      const isRoomNumberExist = await Room.findOne({
        where: { room_number },
      });

      if (isRoomNumberExist) {
        return response(res, 400, "شماره اتاق وارد شده تکراری است");
      }
    }

    room.room_number = room_number || room.room_number;
    room.floor = floor || room.floor;
    room.room_type = room_type || room.room_type;
    room.capacity = capacity || room.capacity;
    room.price_per_night = price_per_night || room.price_per_night;

    await room.save();

    return response(res, 200, "اتاق با موفقیت ویرایش شد");
  } catch (err) {
    next(err);
  }
};
