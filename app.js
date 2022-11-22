//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Eletmetrix:zKWpNNH3Ij2Xe5wd@cluster0.ih5qiud.mongodb.net/test",{useUnifiedTopology:true,useNewUrlParser:true});

const itemsSchema = {
    name: String
};

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

const Item = mongoose.model("Item",itemsSchema);

app.get('/', (req, res) => {
    List.find(function(err, lists) {
        if(err) console.log(err);
        else {
            console.log(lists);
            res.render("list", {Lists: lists});
        }
    });
});

app.post('/api/add',function(req,res){
    var itemToAdd = req.body.task;
    var listName = req.body.listName.trim();
    List.findOne({name:listName},(err,list)=>{
        console.log(list);
        const newItem = new Item({
            name: itemToAdd
        });
        list.items.push(newItem);
        list.save().then(function(){
            res.redirect('/');
        });
    })    
})


app.post('/api/delete',(req,res)=>{
    const itemId = req.body.ID.trim(); 
    const listName = req.body.listName.trim();
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:itemId}}},function(err,foundList){
        if(err) console.log(err);
        else {
            console.log("İtem, listeden başarıyla silindi: " + foundList);
            res.redirect('/');
        }
    });
});

app.post('/api/deleteList', (req, res)=>{
    const listId = req.body.ID.trim(); 
    List.remove({_id:listId},function(err){
        if(err) console.log(err);
        else {
            console.log("Liste başarıyla silindi");
            res.redirect('/');
        }
    });
});

app.post('/api/create',function(req,res){
    const listName = req.body.listName.trim();

    List.findOne({name:listName},function(err,list) {
        if(err) console.log(err);
        else {
            if(list !== null){
                console.log("Liste mevcut");    
                res.redirect('/');            
            }else{
                console.log("Liste mevcut değil. Yeni bir liste oluşturuluyor.");
                const list = new List({
                    name: listName,
                    items: []
                });
                list.save().then(function(){
                    res.redirect('/');
                });
            }
        }
    })
})

// Sunucumuzu burada tanımlı olan portta başlatıyoruz.
app.listen(port, () => console.log(`Site ${port} numarasında dinlenmekte.`));