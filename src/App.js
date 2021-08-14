import { useState, useEffect } from "react";
import './App.css';
import Post from './Post';
import { auth, db } from "./firebase";
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Button, Input } from "@material-ui/core";
import ImageUpload from "./ImageUpload";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));


const App = () => {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  //Modal Style
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  //
  const [user, setUser] = useState(null);
  //Sign In modal
  const [openSignIn, setOpenSignIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        //user has logged in
        console.log(authUser);
        setUser(authUser);
        if (authUser.displayName) {
          //do not update username
        } else {
          //if we just created someone
          return authUser.updateProfile({
            displayName: username,
          });
        }
      }
      else {
        //user has logged out
        setUser(null);
      }
    });

    return () => {
      //cleanup 
      unsubscribe();
    }
  }, [user, username])

  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map((doc) => ({
        id: doc.id,
        post: doc.data()
      })));
    })
  }, []);

  const handleSignUp = (event) => {
    event.preventDefault();
    auth.createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        authUser.user.updateProfile({
          displayName: username
        })
      })
      .catch((error) => alert(error.message))
    setOpen(false);
  }

  const handleSignIn = (e) => {
    e.preventDefault();
    auth.signInWithEmailAndPassword(email, password)
      .catch(error => alert(error.message))
    setOpenSignIn(false);
  }

  return (
    <div className="app">
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img
                src="https://logos-world.net/wp-content/uploads/2020/04/Instagram-Logo.png"
                alt=""
                className="app__headerImage"
              />
            </center>
            <Input
              placeholder="Username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />

            <Input
              placeholder="Email"
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button onClick={handleSignUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>

      {/* Login Modal */}

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img
                src="https://logos-world.net/wp-content/uploads/2020/04/Instagram-Logo.png"
                alt=""
                className="app__headerImage"
              />
            </center>
            <Input
              placeholder="Email"
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button onClick={handleSignIn}>Sign In</Button>
          </form>
        </div>
      </Modal>


      <div className="app__header">
        <img
          src="https://logos-world.net/wp-content/uploads/2020/04/Instagram-Logo.png"
          alt=""
          className="app__headerImage"
        />
        {user ?
          (<Button onClick={() => auth.signOut()}>Logout</Button>) :
          (<div className="app__loginContainer">
            <Button onClick={() => setOpenSignIn(true)}>Sign in</Button>
            <Button onClick={() => setOpen(true)}>Sign Up</Button>
          </div>
          )
        }
      </div>

      <div className="app__posts">
        {
          posts.map(({ id, post }) => <Post user={user} key={id} postId={id} username={post.username} caption={post.caption} imageUrl={post.imageUrl} />)
        }
      </div>

      {
        user?.displayName ?
          (<ImageUpload username={user.displayName} />) :
          (<h3>login to upload</h3>)
      }

    </div>
  )
}

export default App;
