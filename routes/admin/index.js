const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post = require('../../models/Post');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*',userAuthenticated,(req,res,next)=>
{
    req.app.locals.layout = 'admin';
    next();
});

//route home
router.get('/',(req,res)=>
{
    res.render('admin/index');
});



router.post('/generate-fake-posts',(req,res)=>{

    
    for(let i=0; i < req.body.amount; i++)
    {
        let post = new Post();

        post.no = i;
        post.title = faker.name.title();
        post.status = 'public';        
        post.allowcomments = faker.random.boolean()
        post.body = faker.lorem.sentence();

        post.save(function(err){
            if(err) throw err;
        });        
    }
    res.redirect('/admin/posts');
})

module.exports = router;
