const express = require('express');
const router = express.Router();
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
const fs = require('fs');
const Post = require('../../models/Post');  
const Category = require('../../models/Category');  
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*',userAuthenticated,(req,res,next)=>
{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/',(req,res)=>
{
    Post.find({})
    .populate('category')
    .then(posts=>{
        res.render('admin/posts',{posts: posts});
    })
    
});

router.get('/create',(req,res)=>
{
    Category.find({}).then(categories=>{
        res.render('admin/posts/create', {categories:categories});
    })
   
});

router.post('/create',(req,res)=>
{
    let filename ='';

    if(!isEmpty(req.files))
    {
        let file = req.files.file;
        filename = Date.now() + '-' +  file.name;
        let diruploads = './public/uploads/';

        file.mv(diruploads + filename,(err)=>{
            if(err) throw err;
        });
        
    }
   
   
    let allowcomments = true;
        if(req.body.allowcomments)
        {
            allowcomments = true;
        }
        else
        {
            allowcomments = false;
        }
    const newPost = new Post({
        title : req.body.title,
        status: req.body.status,
        allowcomments: allowcomments,
        body: req.body.body,
        category: req.body.category,
        file : filename
 
    });
    newPost.save().then(savedPost=>{

        req.flash('success_message',`Post ${ savedPost.title } was created successfully`);
        res.redirect('/admin/posts')
    }).catch(err =>{
        console.log('Could not save post'+ err);
    });

});


router.get('/edit/:id',(req,res)=>{

   Post.findOne({_id: req.params.id}).then(post =>{
    Category.find({}).then(categories=>{
        res.render('admin/posts/edit',{post: post,categories:categories});
    })
   })

    
});


router.put('/edit/:id',(req,res)=>{

    Post.findOne({_id: req.params.id}).then(post =>{

            
        if(req.body.allowcomments)
        {
            allowcomments = true;
        }
        else
        {
            allowcomments = false;
        }

        post.title = req.body.title,
        post.status = req.body.status,
        post.allowcomments = allowcomments,
        post.body = req.body.body;
        post.category = req.body.category;

        

    if(!isEmpty(req.files))
    {
        let file = req.files.file;
        filename = Date.now() + '-' +  file.name;
        let diruploads = './public/uploads/';
        post.file = filename;

        file.mv(diruploads + filename,(err)=>{
            if(err) throw err;
        });
        
    }

        post.save().then(updatedpost=>{

            req.flash('success_message','Post was successfully updated');
            res.redirect('/admin/posts');
        }).catch(err =>{
            console.log('err'+err);
    })
        
   }).catch(err =>{
    console.log('err'+err)});
});

router.delete('/:id',(req,res)=>
{
    Post.deleteOne({_id: req.params.id}).then(post=>{
        fs.unlink(uploadDir + post.file, (err)=>{
            req.flash('success_message','Post was Deleted Successfully');
            res.redirect('/admin/posts');
        })       
    }).catch(err=>{
        console.log('error'+err);
    });
});



module.exports = router;