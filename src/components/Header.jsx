// import styles from './Header.module.css';

// const MODEL_LABEL = import.meta.env.VITE_GROQ_MODEL || 'Groq';

// export default function Header() {
//   return (
//     <header className={styles.header}>
//       <div className={styles.inner}>
//         <div className={styles.logo}>
//           <div className={styles.logoIcon}>⬡</div>
//           <div>
//             <h1 className={styles.title}>AI Dimensional Modeler</h1>
//             <p className={styles.subtitle}>Kimball Dimensional Modeling</p>
//           </div>
//         </div>
//         <div className={styles.pills}>
//           <span className="badge badge-teal">Groq · {MODEL_LABEL}</span>
//           <span className="badge badge-gold">Cognos → Cloudera</span>
//           <span className="badge badge-blue">DRAFT — Needs Review</span>
//         </div>
//       </div>
//     </header>
//   );
// }
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⬡</div>
          <div>
            <h1 className={styles.title}>AI Dimensional Modeler</h1>
          </div>
        </div>
      </div>
    </header>
  );
}