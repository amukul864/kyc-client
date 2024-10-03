import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = () => (
	<div className={styles.spinner}>
		<div className={styles.bounce1}></div>
		<div className={styles.bounce2}></div>
	</div>
);

export default LoadingSpinner;
