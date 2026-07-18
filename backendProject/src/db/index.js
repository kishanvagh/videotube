import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        // Insert the DB name as a path segment before any query string, so this
        // works whether MONGODB_URI ends bare or already has "?..." params.
        const [baseUri, query] = process.env.MONGODB_URI.split("?")
        const uri = `${baseUri.replace(/\/$/, "")}/${DB_NAME}${query ? `?${query}` : ""}`

        const connectionInstance = await mongoose.connect(uri)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB