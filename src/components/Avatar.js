import React, {useState} from 'react';
import Avatar from 'react-avatar-edit'


const UploadAvatar = () => {
  const [preview, setPreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  function onClose() {
    setPreview(newImage);
  }
  function onCrop(pv) {
    setNewImage(pv);
  }
  function onClick() {
    setPreview(null);
  }

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
      {preview && <img onClick={onClick} src={preview} alt="Preview" />}
    </div>
  );
}

export default UploadAvatar;