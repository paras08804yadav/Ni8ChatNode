
const mongoose = require('mongoose');
const UserNotification = require('./models/userNotification');
const HostNotification = require('./models/hostNotification');
const AgencyNotification = require('./models/agencyNotification');

const insertDummyData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/meltX');

    const userId = "675fc713575f91ed1043f02a";
    const hostId = "675fc85efac9587df941a5ad";
    const agencyId = "675fc95f7ae8b2c1c7030c6d";

    const photos = [
      '/uploads/images/photo1.jpg',
      '/uploads/images/photo2.jpg',
      '/uploads/images/photo3.jpg',
      '/uploads/images/photo4.jpg',
      '/uploads/images/photo5.jpg',
    ];

    const notifications = [
      { title: "Welcome Notification", description: "Welcome to our platform!" },
      { title: "Feature Update", description: "Check out our new features." },
      { title: "Maintenance Alert", description: "Scheduled maintenance tonight." },
      { title: "Special Offer", description: "Don't miss our special offer!" },
      { title: "Account Reminder", description: "Please verify your email address." },
    ];

    // User Notifications
    const userNotifications = notifications.map((notif, index) => ({
      user_id: userId,
      photo: photos[index],
      title: notif.title,
      description: notif.description,
    }));
    await UserNotification.insertMany(userNotifications);

    // Host Notifications
    const hostNotifications = notifications.map((notif, index) => ({
      host_id: hostId,
      photo: photos[index],
      title: notif.title,
      description: notif.description,
    }));
    await HostNotification.insertMany(hostNotifications);

    // Agency Notifications
    const agencyNotifications = notifications.map((notif, index) => ({
      agency_id: agencyId,
      photo: photos[index],
      title: notif.title,
      description: notif.description,
    }));
    await AgencyNotification.insertMany(agencyNotifications);

    console.log("Dummy data inserted successfully!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting dummy data:", error.message);
    mongoose.connection.close();
  }
};

insertDummyData();
