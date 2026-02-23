import bcrypt from "bcryptjs";
import User from "../models/user.model";

export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(" Admin user already exists.");
      return;
    }
    if (!adminEmail || !process.env.ADMIN_PASSWORD) {
      console.log(" Admin email or password not found in environment variables.");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const adminUser = new User({
      name: "Admin User",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await adminUser.save();
    console.log("Admin user seeded successfully.");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};
