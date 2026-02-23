import User from "../models/user.model";

export const getAllUsers = async () => {
  return await User.find({ role: "user" }).select("-password -otp -otpExpires");
};

export const deleteUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "user") {
    throw new Error("Cannot delete non-user roles");
  }

  await User.findByIdAndDelete(userId);
  return { message: "User deleted successfully" };
};
