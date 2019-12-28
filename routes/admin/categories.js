const express = require('express');
const router = express.Router();
const faker = require('faker');
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*',userAuthenticated,(req,res,next)=>
{
    req.app.locals.layout = 'admin';
    next();
});

//route home
router.get('/',(req,res)=>
{
    Category.find({}).then(category=>{
        res.render('admin/categories/index',{category:category});
    })
    
   
});

router.post('/create',(req,res)=>
{
    const newCategory = new Category({
        name : req.body.name
    });

    newCategory.save().then(savedcategory=>{

        res.redirect('/admin/categories');

    });
    
});

router.get('/edit/:id',(req,res)=>
{
    Category.findOne({_id: req.params.id}).then(edit=>{
        res.render('admin/categories/edit',{edit:edit});
    })
    
   
});

router.put('/edit/:id',(req,res)=>
{
    Category.findOne({_id: req.params.id}).then(category=>{
        category.name = req.body.name;

        category.save().then(savedcategory=>{
            res.redirect('/admin/categories');
        })

    })
    
   
});

router.delete('/:id',(req,res)=>{
    Category.deleteOne({_id: req.params.id}).then(result=>{
        res.redirect('/admin/categories');
    })
});

module.exports = router;