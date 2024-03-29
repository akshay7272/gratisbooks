import React, { useEffect, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import Box from "@mui/material/Box";
import MuiPhoneNumber from "material-ui-phone-number-2";
import { db } from "./firebase";
import CssBaseline from "@mui/material/CssBaseline";
import { UserAuth } from "./context/AuthContext";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { storage } from "./firebase";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";

function DonateBook() {
  let nowYear = new Date();
  const { user } = UserAuth();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState(
    dayjs(
      `${nowYear.getFullYear()}-${nowYear.getMonth() + 1}-${nowYear.getDate()}`
    )
  );
  const [yop, setYop] = useState(nowYear.getFullYear());
  const [phone, setPhone] = useState("");
  const [cover, setCover] = useState();
  const [imgLoading, setImgLoading] = useState(false);
  const navigate = useNavigate();
  const theme = createTheme();
  // Getting book Image Upload from Local computer
  const uploadImage = (e) => {
    setImgLoading(true);
    const imageRef = ref(storage, `items/${Date.now()}`);
    uploadBytes(imageRef, e.target.files[0]).then((snapshot) => {
      console.log(snapshot, "snapshot");
      getDownloadURL(snapshot.ref).then(
        (url = URL.createObjectURL(e.target.files[0])) => {
          setCover(url);
          setImgLoading(false);
        }
      );
    });
  };
  // Adding book data to Firebase Firestore
  const postData = async () => {
    if (!title || !author || !yop || !phone || !cover) {
      alert("please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "books"), {
        title,
        author,
        yop,
        phone,
        uid: user.uid,
        photo: user.photoURL,
        cover,
        likes: 0,
        comments: [],
        isBooked: false,
      });
      alert("Thank You! Posted successfully");
      navigate("/");
    } catch (err) {
      alert("someThing went wrong. try again");
      console.log(err);
    }
  };
  // Setting phone no. value
  const handleOnChange = (value) => {
    setPhone(value);
  };
  // Setting Year of Publication
  useEffect(() => {
    console.log(yop, "yop", typeof yop);
  });
  return (
    <>
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "2rem",
            }}
          >
            <Typography variant="h4" component="h2">
              Donate Book
            </Typography>
            <TextField
              margin="normal"
              required
              label="Book title"
              name="book title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoComplete=""
              autoFocus
            />
            <TextField
              margin="normal"
              required
              value={author}
              fullWidth
              onChange={(text) => setAuthor(text.target.value)}
              label="Author"
              name="author"
              autoComplete=""
              autoFocus
            />
            <>
              <div className="date">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack>
                    <DatePicker
                      className="date"
                      views={["year"]}
                      label="Year only"
                      value={date}
                      onChange={(newValue) => {
                        setDate(newValue);
                        setYop(newValue.$y);
                      }}
                      inputProps={{
                        disabled: true,
                      }}
                      renderInput={(params) => (
                        <TextField {...params} helperText={null} />
                      )}
                    />
                  </Stack>
                </LocalizationProvider>
              </div>
            </>

            <MuiPhoneNumber
              margin="normal"
              required
              regions={"asia"}
              defaultCountry={"in"}
              fullWidth
              value={phone}
              onChange={handleOnChange}
              variant="outlined"
              label="Phone Number"
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                margin="normal"
                component="label"
                sx={{ marginTop: "16px", marginBottom: "8px", width: "80%" }}
              >
                <input
                  id="photo"
                  accept="image/*"
                  type="file"
                  onChange={uploadImage}
                />
              </Button>
              {imgLoading && <CircularProgress />}
              {cover && (
                <img
                  alt="cover"
                  src={cover}
                  width="50"
                  height="50"
                  style={{ objectFit: "cover" }}
                />
              )}
            </Box>
            <Button
              variant="contained"
              margin="normal"
              type="submit"
              onClick={postData}
              sx={{ marginTop: "16px", marginBottom: "8px" }}
            >
              Submit
            </Button>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  );
}

export default DonateBook;
