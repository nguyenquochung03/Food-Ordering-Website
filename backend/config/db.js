import mongoose from "mongoose"

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://nguyenhungnqh27:27032003@cluster0.mmachao.mongodb.net/food-delivery')
        .then(() => {
            console.log("DB connected");
        })
}

// mongodb://localhost:27017/FoodDeliveryWebsite
// mongodb+srv://nguyenhungnqh27:27032003@cluster0.mmachao.mongodb.net/?