import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import './App.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const App = () => {
  const [videoFile, setVideoFile] = useState();
  const [subtitles, setSubtitles] = useState([]);
  const [uploadCount, setUploadCount] = useState(0)
  const [subtitleResult, setSubtitlesResult] = useState(0)
  const videoRef = useRef(null);

  const upload = async () => {
    if (subtitles.length > 0 && videoFile) {
      let subs = subtitles;

      if (!subs.includes('subtitles')) {
        subs = "WEBVTT \n" + subs;
      }


      console.log('Video File to be sent:', videoFile);
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('subtitles', JSON.stringify(subs));

      try {
        axios.post('https://subtitle-back.vercel.app/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then(response => {
            fetchSubtitles();
            console.log(response);
          })
          .catch(error => {
            console.error(error);
          });

      } catch (error) {
        console.error('Error uploading video:', error);
      }
    }
  }

  useEffect(() => {
    (async () => await fetchSubtitles())();
  }, [])

  const handleVideoUpload = (event) => {
    try {
      const file = event.target.files[0];
      setVideoFile(file);

      setSubtitles([]); // Reset subtitles when a new video is uploaded
    } catch (error) {
      console.error('Error handling video upload:', error);
    }
  };

  const handleSubtitleAdd = (event) => {
    const text = event.target.value.trim();
    setSubtitles(text);
  };

  const fetchSubtitles = async () => {
    try {

      const response = await axios.get('https://subtitle-back.vercel.app/captions', {
        responseType: 'blob',
      });
      const captionsBlob = new Blob([response.data], { type: 'text/vtt' });
      const captionsUrl = URL.createObjectURL(captionsBlob);
      setSubtitlesResult(captionsUrl);
    } catch (error) {
      console.error('Error fetching subtitles:', error);
    }
  };

  const videoDiv = useMemo(() => {
    return <div className="video-div">
      <video controls width="100%" height="100%">
        <source src="https://subtitle-back.vercel.app/uploads/video.mp4" type="video/mp4" />
        <track kind="subtitles" src={subtitleResult} srclang="en" label="English" default />
        Your browser does not support the video tag.
      </video>
    </div>;
  }, [subtitleResult]);

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card>
            <Card.Header>New video upload</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group controlId="formFileSm" className="mb-3">
                  <Form.Label>Select video</Form.Label>
                  <Form.Control type="file" size="sm" accept="video/*" onChange={handleVideoUpload} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                  <Form.Label>Enter subtitles (in WEBVTT format only)</Form.Label>
                  <Form.Control as="textarea" placeholder="E.g. 00:01.000 --> 00:04.000
- Never drink liquid nitrogen." rows={5} onChange={(e) => handleSubtitleAdd(e)} />
                </Form.Group>
                <Button variant="primary" type="button" onClick={upload}>
                  Upload
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Header>Uploaded video with subtitles</Card.Header>
            <Card.Body>
              <div className="video-div">
                <video controls width="100%" height="100%">
                  <source src="https://subtitle-back.vercel.app/uploads/video.mp4" type="video/mp4" />
                  <track kind="subtitles" src={subtitleResult} srclang="en" label="English" default />
                  Your browser does not support the video tag.
                </video>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
