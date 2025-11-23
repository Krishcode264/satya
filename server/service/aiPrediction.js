const axios = require("axios");
require("dotenv").config();

const aiPrediction = async (input) => {
    try {
        const url = process.env.PY_API_URL || "https://attack-n8za.onrender.com";

        const response = await axios.post(
            `${url}/analyze`,
            { payload: input },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error("AI Prediction Error: ", error.response?.data || error.message);
        return null;
    }
};

module.exports = { aiPrediction };
