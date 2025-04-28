const Form = require("../model/formSchema");

const getTotalForms = async (req, res) => {
  try {
    const totalForms = await Form.countDocuments();

    return res
      .status(200)
      .json({ message: "Total forms fetched successfully", total: totalForms });
  } catch (error) {
    console.error("Error fetching total forms:", error);
    return res.status(500).json({
      message: "Server error while fetching total forms",
      error: error.message,
    });
  }
};

module.exports = { getTotalForms };
