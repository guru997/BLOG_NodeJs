const express = require('express');
const router = express.Router();
const Post = require('../../models/Post')
const Category = require('../../models/Category')
const User = require('../../models/User');

const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.all('/*',(req,res,next)=>
{
    req.app.locals.layout = 'home';
    next();
});


//route home
router.get('/',(req,res)=>
{
    Post.find({}).then(posts =>{

        Category.find({}).then(categories=>{
            res.render('home/index',{posts: posts , categories:categories});
        });
        
    });
   
});

//route about
router.get('/about',(req,res)=>
{
    res.render('home/about');
});

//route login
router.get('/login',(req,res)=>
{
    res.render('home/login');
});


//app LOGIN
passport.use(new LocalStrategy({usernameField: 'email'},(email,password,done)=>
{

    User.findOne({email:email}).then(user=>{
        if(!user)  return done(null,false,{message: 'User not found'});
        bcrypt.compare(password, user.password,(err,matched)=>{
            if(err) return err;

            if(matched){
                return done(null,user);
            }
            else
            {                  
                return done(null,false, {message:'Incorrect Password'});
            }
        })
    })
}));

passport.serializeUser(function(user,done)
{
    done(null,user.id);
})

passport.deserializeUser(function(id,done)
{
    User.findById(id,function(err,user)
    {
        done(err,user);
    });
});

//route POST login
router.post('/login',(req,res,next)=>
{
    passport.authenticate('local',{
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req,res,next);
   
});

//route logout
router.get('/logout',(req,res)=>
{
    req.logOut();
    res.redirect('/login')
})

//route register
router.get('/register',(req,res)=>
{
    res.render('home/register');
});

//route POST register
router.post('/register',(req,res)=>
{
    let errors=[];
    if(req.body.password != req.body.passwordConfirm)
    {
        errors.push({message: 'Password not match'});
    }
    if(errors.length>0)
    {
        res.render('home/register',{
            errors : errors,
            firstname: req.body.firstname,
            lastname: req.body.lasttname,
            email: req.body.email,
        });
    }
    else
    {
        User.findOne({email: req.body.email}).then(user=>{
            if(!user)
            {
                const newUser = new User({
                    firstname: req.body.firstname,
                    lastname: req.body.lasttname,
                    email: req.body.email,
                    password: req.body.password
                });
        
                bcrypt.genSalt(10, (err,salt)=>{
                    bcrypt.hash(newUser.password, salt, (err,hash)=>{
                        
                        newUser.password = hash;
                        newUser.save().then(savedUser=>
                            {
                                req.flash('success_message','You are now Registered Login Now');
                                res.redirect('/login');
                            }).catch(err =>{
                                console.log('Could not save User'+ err);
                            });
                    })
                })
            }
            else
            {
                req.flash('error_message','Email already exists, Try login');
                res.redirect('/login');
            }
        })
        

        
    }
});

//route for Read more single post
router.get('/post/:id',(req,res)=>
{
    Post.findOne({_id: req.params.id}).then(post=>{
        Category.find({}).then(categories=>{
            res.render('home/post',{post: post , categories:categories});
        });
    });
   
});

module.exports = router;