import Entry from "@/models/Entry";
import connectDB from "@/middlewares/db";
const bcrypt = require('bcrypt');
const crypto = require('crypto');
import { NextApiRequest, NextApiResponse } from "next";
const saltRounds = 10;

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
const iv = crypto.randomBytes(16);  // 128-bit IV (Initialization Vector)

// Function to encrypt text using AES-256-GCM
function encryptText(plainText:String) {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encryptedText = cipher.update(plainText, 'utf8', 'hex');
    encryptedText += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return {
        encryptedData: encryptedText,
        iv: iv.toString('hex'),
        authTag: authTag
    };
}

const handler = async (req:NextApiRequest, res:NextApiResponse) => {

    if (req.method == "POST") {
        const data = encryptText(req.body.content)
        const encryptedContent = data.encryptedData;
        const iv = data.iv;
        const authTag = data.authTag;
        const hashedPassword = await bcrypt.hash(req.body.passcode, saltRounds);
        let entry = new Entry({

            username: req.body.username,
            title: req.body.title,
            type: req.body.type,
            encryptedContent: encryptedContent,
            iv: iv,
            authTag: authTag,
            encryptionAlgo: "",
            shareCode: 12,
            passcodeHash: hashedPassword,
            expiryDate: req.body.expiryDate,
            accessCount: req.body.accessCount,
            maxAccessCount: req.body.maxAccessCount
            })
          
            const result = await entry.save();
        


            const id = result._id; 
        res.status(200).json({type: "success", message: "Entry Added Successfully", id: id})
       }

    else {
        res.status(400).json({type: "error", message: "ERROR. "})
    }
}

export default connectDB(handler);