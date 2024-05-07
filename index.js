const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const port = 4000;

mongoose.connect("mongodb://localhost:27017/moneyTracker");
const moneySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["income", "expenses"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  info: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
});

const moneyModel = mongoose.model("tracks", moneySchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const expenses = async () => {
  const findExpenses = await moneyModel.find({ category: "expenses" });
  let totalExpenses = 0;

  for (let i = 0; i < findExpenses.length; i++) {
    totalExpenses += findExpenses[i].amount;
  }

  return totalExpenses;
};

const income = async () => {
  const findIncome = await moneyModel.find({ category: "income" });
  let totalIncome = 0;

  for (let i = 0; i < findIncome.length; i++) {
    totalIncome += findIncome[i].amount;
  }

  return totalIncome;
};

app.get("/", async (req, res) => {
  try {
    const finalData = await moneyModel.find({});
    const totalIncome = await income();
    const totalExpenses = await expenses();
    const netTotal = totalIncome - totalExpenses;
    res.render("home", { finalData, totalIncome, totalExpenses, netTotal });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/", async (req, res) => {
  try {
    let formData = {
      category: req.body.category,
      amount: req.body.amount,
      info: req.body.info,
      date: req.body.date,
    };
    let saveData = await new moneyModel(formData).save();
    console.log(saveData);
    // const finalData = await moneyModel.find({});
    // res.render('home', { finalData });
    res.redirect("/");
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/favicon.ico", (req, res) => {
  // Respond with a 204 No Content status
  res.status(204).end();
});

// app.get('/:id', async (req, res) => {
//     try {
//         const deletedData = await moneyModel.findByIdAndDelete(req.params.id);
//         console.log('Data deleted successfully:', deletedData);
//         const finalData = await moneyModel.find({});
//         res.render('home', { finalData });
//     } catch (error) {
//         console.error('Error deleting data:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.get("/:id", async (req, res) => {
  try {
    // Ensure the request parameter is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid ID");
    }
    const deletedData = await moneyModel.findByIdAndDelete(req.params.id);
    console.log("Data deleted successfully:", deletedData);
    // const finalData = await moneyModel.find({});
    // res.render('home', { finalData });
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log("app is running on", port);
});
