 
export default function Footer() {
  return (
    <>
    <footer className="mt-auto text-white-50">
      <p className="small"><a href={process.env.PROJECT_URL} className="link-light"><img src={process.env.PROJECT_LOGO_URL} height="30px"/></a> </p>
    </footer>
    </>
  );
}
