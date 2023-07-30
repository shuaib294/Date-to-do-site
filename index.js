const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const dotenv = require("dotenv");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
dotenv.config();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser:true}).then(()=>{console.log("connected to database")});

const itemSchema = {
    name:String
}

const listSchema = {
    name:String,
    items:[itemSchema]
}

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemSchema);
const defaultitems = [
    {
        name: "Welcome to your list!"
    },

    {
        name:"click on + to add new item and checkbox to delete."
    }
]


Item.insertMany(defaultitems);





var workItems = [];

async function getItems(){

    const Items = await Item.find({});
    return Items;
  
  }

const day = date.getday();

app.get("/",function(req,res){

    getItems().then(function(FoundItems){
    
        res.render("list", {listtitle: day, newItem:FoundItems});
    
      });

});

app.post("/", function(req, res){
    const itemName = req.body.todo;
    const listName = req.body.list;

    const newitem = new Item({ 
        name:itemName
    });

    if(listName === day){
       
        newitem.save();
    
        res.redirect("/")
    }else{
        List.findOne({name:listName}).then(function(foundList){
            foundList.items.push(newitem);
            foundList.save();
            res.redirect("/"+listName);
        })
    }

    
})

app.post("/delete",function(req, res){
    const itemid = req.body.checkbox;
    const listName = req.body.list;

    if(listName === day){
        Item.findByIdAndRemove(itemid).then(function(){
            console.log("Successfully removed");
            })
            .catch(function (err) {
            console.log(err);
            });
            res.redirect("/");
    }else{
        List.findOne({name:listName}).then(function(foundList){
            List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:itemid}}}).then(function(){
                res.redirect("/"+listName);
            });
        })
    }

    
});

app.post("/listbtn",function(req, res){
    const listname = _.capitalize(req.body.listname);
    res.redirect("/" + listname);
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}).then(function(foundList){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultitems
                })
            
                list.save();

                res.render("list", {listtitle:customListName, newItem:list.items})
                
            }else{
                
                res.render("list", {listtitle: foundList.name, newItem:foundList.items})
            }
    })

   

})

app.get("/work",function(req, res){
    res.render("list",{listtitle:"Work List",newlistitems:workItems})
})

app.listen(process.env.PORT || 3000,function(){
    console.log("Server started on port 3000");
})