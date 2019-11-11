const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');
// All author routes
router.get('/', async (req,response)=>{
    let searchOptions = {};
    if(req.query.name !== null && req.query.name !==''){
        searchOptions.name = new RegExp(req.query.name,'i');
    }
    try {
        const authors = await Author.find(searchOptions);
        response.render('authors/index',{
            authors:authors,
            searchOptions: req.query
        });
    } catch  {
        response.redirect('/');
    }
})

//New author router
router.get('/new',(req,response)=>{
    response.render('authors/new',{
        author: new Author()
    });
})
// create new author
router.post('/',async (req,response)=>{
    const author = new Author({
        name:req.body.name,
    });
    try{
        const newAuthor = await author.save();
        response.redirect(`authors/${newAuthor.id}`);
        response.redirect('authors');
    }
    catch{
        response.render('authors/new',{
            author:author,
            errorMessage:'Something went wrong',
        });
    }
});

// show single author
router.get('/:id',async (req,res)=>{
    try{
        const author = await Author.findById(req.params.id);
        const books = await  Book.find({author:author.id}).limit(6).exec();
        const data ={
            author:author,
            booksByAuthor:books,
        }
        res.render('authors/show', data)
    }
    catch (err){
        console.log(err);
        res.redirect('/')
    }
});

// updating particular author
router.get('/:id/edit',async (req,res)=>{
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit',{author:author })
    } catch {
        res.redirect('/authors');
    }
});

router.put('/:id',async (req,response)=>{
    let author;
    try{
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        response.redirect(`/authors/${author.id}`);
    }
    catch{
        if(author === null){
            res.redirect('/');
        }
        response.render('authors/edit',{
            author:author,
            errorMessage:'Something went wrong Error updating author',
        });
    }
});
router.delete('/:id',async (req,res)=>{
    let author;
    try{
        author = await Author.findById(req.params.id);
        console.log(author);
        await author.remove();
        console.log(author);
        console.log('1');
        res.redirect(`/authors`);
    }
    catch{
        
        if(author === null){
            console.log('2')
            res.redirect('/');
        }
        else{
            console.log('3')
            res.redirect(`/authors/${author.id}`)
        }
    }
});
module.exports = router;