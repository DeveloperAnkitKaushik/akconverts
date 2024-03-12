import styles from "./page.module.css";
import Dropzone from "@/component/dropzone";

export default function Home() {
  return (
    <>
      <div className="maincontainer">
        <div className={styles.container}>
          <div className={styles.innercontainer}>
            <div className={`${styles.heading} text-gradient`}>
              Convert images, audios, and videos to your liking.
            </div>
            <div className={styles.para}>
              Transform your digital content effortlessly. Convert images,
              audios, and videos to suit your preferences with our user-friendly
              and versatile tools.
            </div>
          </div>
          <Dropzone />
        </div>
      </div>
    </>
  );
}
