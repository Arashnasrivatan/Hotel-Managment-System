# 🏨 Hotel Booking API

Welcome to the **Hotel Booking API**! This API allows users to register, book rooms, and manage hotel-related operations efficiently. Below is the detailed information to help you get started.

---

## 🚀 Features

- **Authentication**: Secure user login, registration, and token-based authentication.
- **Room Management**: Create, update, delete, and list hotel rooms.
- **Booking System**: Book rooms, check availability, and manage reservations.
- **Payment Processing**: Record, update, and delete payments.
- **User Management**: Admin controls for user accounts.

---

## 📚 Endpoints

### **1. Authentication**

| Endpoint    | Method | Description                             | Access |
| ----------- | ------ | --------------------------------------- | ------ |
| `/register` | `POST` | Register a new user (with avatar)       | Public |
| `/login`    | `POST` | Login and receive authentication tokens | Public |
| `/me`       | `GET`  | Get current user details                | User   |
| `/refresh`  | `POST` | Refresh the access token                | Public |
| `/logout`   | `GET`  | Logout and invalidate tokens            | User   |

### **2. Users**

| Endpoint     | Method   | Description                    | Access |
| ------------ | -------- | ------------------------------ | ------ |
| `/users`     | `GET`    | Get a list of all users        | Admin  |
| `/users/:id` | `GET`    | Get details of a specific user | Admin  |
| `/users/:id` | `PUT`    | Update user details            | Admin  |
| `/users/:id` | `DELETE` | Delete a user                  | Admin  |

### **3. Rooms**

| Endpoint                 | Method   | Description                    | Access |
| ------------------------ | -------- | ------------------------------ | ------ |
| `/rooms`                 | `GET`    | List all rooms                 | Public |
| `/rooms/:id`             | `GET`    | Get details of a specific room | Public |
| `/rooms`                 | `POST`   | Add a new room                 | Admin  |
| `/rooms/:id`             | `PUT`    | Update room details            | Admin  |
| `/rooms/:id`             | `DELETE` | Delete a room                  | Admin  |
| `/rooms/:id/images`      | `POST`   | Upload images for a room       | Admin  |
| `/rooms/:id/images`      | `GET`    | Retrieve all images for a room | Public |
| `/rooms/images/:imageId` | `DELETE` | Remove a specific room image   | Admin  |

### **4. Bookings**

| Endpoint                 | Method   | Description                                            | Access     |
| ------------------------ | -------- | ------------------------------------------------------ | ---------- |
| `/bookings`              | `GET`    | Get all bookings (Admin sees all, user sees their own) | Admin/User |
| `/bookings/:id`          | `GET`    | Get booking details                                    | Admin/User |
| `/bookings`              | `POST`   | Create a new booking                                   | User       |
| `/bookings/:id`          | `PUT`    | Update a Booking                                       | User/Admin |
| `/bookings/:id`          | `DELETE` | Cancel a booking                                       | User       |
| `/bookings/availability` | `POST`   | Check room availability for a given date range         | Public     |

### **5. Payments**

| Endpoint        | Method   | Description                       | Access |
| --------------- | -------- | --------------------------------- | ------ |
| `/payments`     | `GET`    | List all payments                 | Admin  |
| `/payments/:id` | `GET`    | Get details of a specific payment | Admin  |
| `/payments`     | `POST`   | Record a new payment              | Admin  |
| `/payments/:id` | `PUT`    | Update payment details            | Admin  |
| `/payments/:id` | `DELETE` | Delete a payment                  | Admin  |

---

## 🛠️ Technologies Used

- **Node.js**
- **Express.js**
- **Sequelize ORM**
- **Passport.js** (Authentication)
- **MySQL** (Database)
- **Redis** (Database)

---

## 🛡️ Security

- **Authentication**: Token-based (Access and Refresh tokens).
- **Input Validation**: Using `Yup` for robust schema validation.
- **File Upload**: Secure and organized file storage for images.

---

## 🧠 AI Rating

![AI Rating](https://img.shields.io/badge/Deep%20Seek-8.5%2F10-brightgreen?logo=ai&logoColor=white&style=for-the-badge)

---

## 📞 Contact

For further information or support, feel free to reach out!
