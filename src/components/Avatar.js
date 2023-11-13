import React, {useState, useEffect} from 'react';
import Avatar from 'react-avatar-edit'


const UploadAvatar = (props) => {
  const [preview, setPreview] = useState(props.avatar);
  const [newImage, setNewImage] = useState(props.avatar);
  const editable = props.editable;
  
  const id = props.id;
  function onClose() {
    setPreview(newImage);
    const requestOptions = {
      method: "POST",
      headers: {
          'content-type': 'application/json'
      },
      body: JSON.stringify({id: id, avatar: newImage})
  }
  fetch(`${process.env.REACT_APP_BACKEND_URL}/api/setAvatar`, requestOptions)
      .then(response => response.json())
      .then(data => {
        // console.log(data)
      });

  }
  function onCrop(pv) {
    setNewImage(pv);
  }
  function onClick() {
    if(!editable)
      return;
    setPreview(null);
  }

  useEffect(() => {
    setPreview(props.avatar);
    setNewImage(props.avatar);
    console.log(props.avatar);
    console.log(preview)

  }, [props.avatar]);



  return (
    <div>
      {!preview && (
        <Avatar
          width={200}
          height={200}
          onCrop={onCrop}
          onClose={onClose}
          src={null}
        />
      )}
      {preview  && <img onClick={editable ? onClick : null} src={preview} alt="Preview" />}
      
    </div>
  );
}

export default UploadAvatar;