import Image from "next/image";
import classes from "./Footer.module.scss";
import leaf from "assets/images/leaf.svg";
import negativeLogo from "assets/images/negativeLogo.svg";
export const Footer = () => (
  <div className={classes.container}>
    <div className={classes.leaf}>
      <div className={classes.leafImage}>
        <Image src={leaf} alt="leaf" layout="fill" />
      </div>
    </div>
    <div className={classes.main}>
      <div className={classes.title}>
        <div className={classes.logo}>
          <Image src={negativeLogo} alt="logo" layout="fill" />
        </div>
        <span className={classes.logoTitle}>Biosfera</span>
      </div>
      <div className={classes.links}>
        <a
          href="https://biosfera-files.s3.eu-north-1.amazonaws.com/Biosfera%20-%20Nova%20tehni%C4%8Dka%20dokumentacija.pdf?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmV1LW5vcnRoLTEiRzBFAiEAhznjEdjeedjenO5bqMol5L5I5OQaPHbjTrkSHGL4jrACIGfzxfTUp7kmFL4G3cjk5pMCwGMSAWR%2BietHYf6YUiHUKuQCCF4QABoMOTc1MDUwMzU5MzE5IgwQUo1sZ38oq3fSU1kqwQKubDHS9gcg%2Bfq5Vm1%2BCPWk3WJEdGqUO9TplgaBBYt5VWEU4acNAmV3m0AGQ8rsSqnvW4UjlQqmxwcYd4ZhE260YCaJz%2Fg5Aj1ZOjO0XYu16v9LUlxDXCaxttKPWYYPbapcSUXaZyN3WANu8v60F3X6C81%2BV6AFf5e7Um%2FH02h%2FjVkBgjmX1upHKRWT2pPq9mMIhYvyF6X2u96RuVDpdxrZAEuBmZa7LhshGQNmrIPMDbzA5EN6ZRZwqB05UZ%2BPboswvTkLT%2FOfMsLUW25dMMEqEs4PsCfHYx9oDeFWv01vBFr%2FBKA1JvKtnnTGW7pZ0QUAxO%2BBItjTjTl3pwCbTX2%2F2uwbFVCeQbTMUO5NdoTNHbAmTDhCxLWsdXmnbNfVj7e41lN3yHAkjyxQI4ehtJ%2FsDuSOXcBkQTKJ40Bg%2FSEkTqowiazssgY6swJoAMvB5CsfH4wTQ6aGCumbqNAjtHbhj%2BGaefbzmm79XtVjHd41nihsDQDCA%2BbuvUS3PHBExmxoK8f0VcDAp6m777YBfj06WY7yEVSwjPmXEJHRWYeWGkGE7cSs%2F5upQsx8k%2F71PW9ywIGjbPrvvdYRY1%2BvMlJTmphA66VjMo%2BuiWSo3LsSOL%2FvQJz1W3a6OWOdwdbLH7yPQUnxsdsLF2Y25zqBpEevG0Li83dLSlVFwFx8jOsMOGNlJf27tXxEzkDCD1fJxHwKm%2Buq%2BGGUFNP0QIXCr4kOR7XIURMuTBppgR8P21yXPXj4CNwsqYEtdsQ7hie1ZszNflmMBJAFr72eeF98biAIWPdYnz8CFVUYodvqa%2FYshnE0RS%2Bh%2F6oPHOHr96ousgrFzenGQEIeob2fGo4q&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240601T123821Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIA6GBMHYILV3PEJOZJ%2F20240601%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Signature=5f6dcbd45e3a9ba947ed6db4a44b357b5c53a5d5f7e3fd38fb3e9af4d9cb19dd"
          className={classes.link}
        >
          Dokumentacija
        </a>
      </div>
    </div>
  </div>
);
