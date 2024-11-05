import Header from "./Header";
import HeaderButton from "./HeaderButton";

function HeaderDefault() {
  return (
    <Header>
      <HeaderButton link="about">About</HeaderButton>
      <HeaderButton link="upload">Upload</HeaderButton>
      <HeaderButton link="files">Files</HeaderButton>
    </Header>
  );
}

export default HeaderDefault;
