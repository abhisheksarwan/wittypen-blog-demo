var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var expressSanitizer = require("express-sanitizer");
var striptags = require('striptags');
var methodOverride = require("method-override"); //for making update work //PUT
var app = express();

//please replace CONNECTION when using // deleted my personal database credentials
mongoose.connect("CONNECTION", {useNewUrlParser:true, useUnifiedTopology:true});
mongoose.set("useFindAndModify", false);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method")); //for making update work //PUT

//setup finished

//SCHEMA SETUP
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var blog = mongoose.model("blog", blogSchema);

// blog.create({
//     title: "POST 1",
//     image: "http://www.fs.usda.gov/Internet/FSE_MEDIA/stelprdb5259404.jpg",
//     body: "Beatiful blog!"
// }, function(err, newBlog){
//     if(err) { console.log("Error!");}
//     else { console.log(newBlog)}
// });

//ROUTES

//root
app.get("/", function(req, res){
    res.redirect("blog");
});

//index
app.get("/blog", function(req, res){
    blog.find({}, function(err, blogs){
        blogs.forEach(function(blog){
            blog.body = striptags(blog.body);
        });
        if(err) { console.log("ERROR!");}
        else { res.render("index", {blogs: blogs});}
    })
});

//add blog
app.post("/blog", function(req, res){
req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.create(req.body.blog, function(err, newBlog){ //req.body.blog returns an object
        if(err) { console.log("ERROR!");}
        else { res.redirect("/blog"); }
    })
});

//add blog form
app.get("/blog/new", function(req, res){
    res.render("new");
});

//show blog
app.get("/blog/:id", function(req, res){
    blog.findById(req.params.id, function(err, foundBlog){
        if(err) { console.log("ERROR!");}
        else { res.render("show", {blog: foundBlog});}
    })
});

//edit form
app.get("/blog/:id/edit", function(req, res){
    blog.findById(req.params.id, function(err, foundBlog){
        if(err) { console.log("ERROR!");}
        else { res.render("edit", {blog: foundBlog});}
    })
});

//update form
app.put("/blog/:id", function(req, res){
    blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err) { console.log("Error!");}
        else { res.redirect("/blog/" + req.params.id);}
    });
});

//delete
app.delete("/blog/:id", function(req, res){
    blog.findByIdAndRemove(req.params.id, function(err, deletedBlog){
        if(err) { console.log("Error!");}
        else { res.redirect("/blog"); console.log(deletedBlog);}
    });
});
//PORT
app.listen(process.env.PORT || 3000, function(){
    console.log("Server Started");
}); 