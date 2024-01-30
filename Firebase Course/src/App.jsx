import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { Auth } from "./components/Auth";
import { db, auth, storage } from "./config/firebase";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";

function App() {
  console.log(auth?.currentUser?.uid);
  const [movieList, setMovieList] = useState([]);

  // New movie states
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newReleaseDate, setNewReleaseDate] = useState("");
  const [isNewMovieOscar, setIsNewMovieOscar] = useState(false);

  // File upload/download from storage state
  const [fileUpload, setFileUpload] = useState(null);
  const [fileList, setFileList] = useState([]);

  // Update Title State
  const [updatedTitle, setUpdatedTitle] = useState("");

  const moviesCollectionRef = useRef(collection(db, "movies"));
  // const moviesCollectionRef = useMemo(() => collection(db, "movies"), []);

  const imageListRef = useRef(ref(storage, "projectFiles/"));

  async function deleteMovie(id) {
    try {
      const movieDoc = doc(db, "movies", id);
      await deleteDoc(movieDoc);
      getMovieList();
    } catch (err) {
      console.error(err);
    }
  }

  async function updateMovieTitle(id) {
    try {
      const movieDoc = doc(db, "movies", id);
      await updateDoc(movieDoc, { title: updatedTitle });
      setUpdatedTitle("");
      getMovieList();
    } catch (err) {
      console.error(err);
    }
  }

  const getMovieList = useCallback(async function () {
    try {
      // Read data
      const data = await getDocs(moviesCollectionRef.current);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      // Set movieList
      setMovieList(filteredData);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(
    function () {
      getMovieList();
    },
    [getMovieList]
  );

  async function onSubmitMovie() {
    try {
      await addDoc(moviesCollectionRef.current, {
        title: newMovieTitle,
        releaseDate: newReleaseDate,
        receivedAnOscar: isNewMovieOscar,
        userID: auth?.currentUser?.uid,
      });

      setNewMovieTitle("");
      setNewReleaseDate("");
      setIsNewMovieOscar(false);
      getMovieList();
    } catch (err) {
      console.error(err);
    }
  }

  async function uploadFile() {
    if (!fileUpload) return;

    const filesFolderRef = ref(storage, `projectFiles/${fileUpload.name}`);
    try {
      const snapshot = await uploadBytes(filesFolderRef, fileUpload);
      const url = await getDownloadURL(snapshot.ref);
      setFileList((prev) => [...prev, url]);
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(function () {
    async function downloadFiles() {
      const fileList = await listAll(imageListRef.current);
      console.log("FILE LIST : ", fileList);
      fileList.items.forEach(async (file) => {
        const url = await getDownloadURL(file);
        setFileList((prev) => [...prev, url]);
      });
      // console.log(fileList);
    }
    downloadFiles();
  }, []);

  console.log("THIS IS FILELIST 💥💥💥💥💥💥 ", fileList);

  return (
    <div className="App">
      <Auth />
      <div>
        <input
          value={newMovieTitle}
          placeholder="Movie title..."
          onChange={(e) => setNewMovieTitle(e.target.value)}
        />
        <input
          value={newReleaseDate}
          placeholder="Release date..."
          type="number"
          onChange={(e) => setNewReleaseDate(+e.target.value)}
        />
        <input
          type="checkBox"
          checked={isNewMovieOscar}
          onChange={(e) => setIsNewMovieOscar(e.target.checked)}
        />
        <label>Received an oscar?</label>
        <button onClick={onSubmitMovie}>Submit movie</button>
      </div>
      <div>
        {movieList.map((movie) => (
          <div key={movie.id}>
            <h1 style={{ color: movie.receivedAnOscar ? "green" : "red" }}>
              {movie.title}
            </h1>
            <p>Date : {movie.releaseDate}</p>
            <button onClick={() => deleteMovie(movie.id)}>Delete Movie</button>
            <input
              value={updatedTitle}
              placeholder="Update title..."
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
            <button onClick={() => updateMovieTitle(movie.id)}>
              Update title
            </button>
          </div>
        ))}
      </div>
      <div>
        <input type="file" onChange={(e) => setFileUpload(e.target.files[0])} />
        <button onClick={uploadFile}>Upload File</button>
        {fileList.map((url) => {
          console.log("URL ", url);

          return <img src={url} key={url + v4()} alt="" />;
        })}
      </div>
    </div>
  );
}

export default App;
