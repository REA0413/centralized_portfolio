//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
const mongoose = require('mongoose');
var _ = require('lodash');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-rea:Test123@cluster0.a0g4oqq.mongodb.net/todolistDB', {useNewUrlParser: true});
};

const itemsSchema = new mongoose.Schema({
  name: {
      type: String,
      required: [true, "Please double check your data entry, no name specified"]
  }
});

const Item = mongoose.model('Item', itemsSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = [];
const workItems = [];

const item1 = new Item({
  name: "Eat"
})

const item2 = new Item({
  name: "Sleep"
})

const item3 = new Item({
  name: "Code"
})

const defaultItems = [item1, item2, item3];

const customSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model('List', customSchema);

app.get("/:requiredPage", function(req,res){
  const destination = _.capitalize(req.params.requiredPage);
  console.log(destination);
  if (destination === "Favicon.ico") return;
  List.findOne({name: destination})
  .then(function(foundList){
    if(!foundList){
      const list = new List({
        name: destination,
        items: defaultItems
      })
      list.save();
      res.redirect("/" + destination);
      console.log("Successfully added a new list into the collection!");
      // const day = date.getDate();
      // res.render("list", {listTitle: day, newListItems: list.items});
      
    } else{
      console.log("List exists in the collections");
      const day = date.getDate();

      res.render("list", {listTitle: day, newListItems: foundList.items, foo: foundList.name});
    }
    })
  .catch(function(err){
  console.log(err);
  });
})

app.get("/", function(req, res) {

Item.find({})
.then(function(foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems)
    .then(function(){
      console.log("Succesfully added new items");
    })
    .catch(function(err){
      console.log(err);
    });
    console.log(foundItems);
    res.redirect("/");
  } else {
    const day = date.getDate();

    res.render("list", {listTitle: day, newListItems: foundItems, foo: "Sample"});
  }
  
})
.catch(function(err){
  console.log(err);
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.listButton;

  const item = new Item({
    name: itemName
  });

  if (listName === "Sample"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  .catch(function(err){
    console.log(err);
    });

  }

  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


app.post("/delete", function(req, res){
  const itemID = req.body.checkBox;
  const listName = req.body.listInvisible;

  if (listName === "Sample"){
    Item.findByIdAndRemove(itemID)
    .then(function(){
    console.log("Succesfully removed one items");
    res.redirect("/");
  })
    .catch(function(err){
    console.log(err);
})
  } else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: itemID}}})
    .then(function(foundList){
      res.redirect("/" + listName);
    })
    .catch(function(err){
    console.log(err);
    })
  }
  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
