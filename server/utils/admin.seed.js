const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../modal/Admin");

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)

        console.log("DB Connected")

        const result = await Admin.findOne()

        if (result) {
            console.log("Admin already present")
            process.exit(1)
        }

        const hash = await bcrypt.hash("admin@3428", 10)

        await Admin.create({
            name: "admin",
            email: "shubhamwadje2005@gmail.com",
            password: hash,
            mobile: "9028725948",
        })

        console.log("Admin seed complete")

        process.exit(0)

    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}


seedAdmin()