import { FunctionComponent } from "react";

export interface MsTeamsIconProps {
  height: string;
  width: string;
}

export const MsTeamsIcon: FunctionComponent<MsTeamsIconProps> = ({
  height,
  width,
}) => {
  return (
    // Source: https://commons.wikimedia.org/wiki/File:Microsoft_Office_Teams_(2018%E2%80%93present).svg
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ height, width }}
      viewBox="0 0 2228.833 2073.333"
    >
      <path
        fill="#5059C9"
        d="M1554.637,777.5h575.713c54.391,0,98.483,44.092,98.483,98.483c0,0,0,0,0,0v524.398 c0,199.901-162.051,361.952-361.952,361.952h0h-1.711c-199.901,0.028-361.975-162-362.004-361.901c0-0.017,0-0.034,0-0.052V828.971 C1503.167,800.544,1526.211,777.5,1554.637,777.5L1554.637,777.5z"
      />
      <circle fill="#5059C9" cx="1943.75" cy="440.583" r="233.25" />
      <circle fill="#7B83EB" cx="1218.083" cy="336.917" r="336.917" />
      <path
        fill="#7B83EB"
        d="M1667.323,777.5H717.01c-53.743,1.33-96.257,45.931-95.01,99.676v598.105 c-7.505,322.519,247.657,590.16,570.167,598.053c322.51-7.893,577.671-275.534,570.167-598.053V877.176 C1763.579,823.431,1721.066,778.83,1667.323,777.5z"
      />
      <path
        opacity=".1"
        d="M1244,777.5v838.145c-0.258,38.435-23.549,72.964-59.09,87.598 c-11.316,4.787-23.478,7.254-35.765,7.257H667.613c-6.738-17.105-12.958-34.21-18.142-51.833 c-18.144-59.477-27.402-121.307-27.472-183.49V877.02c-1.246-53.659,41.198-98.19,94.855-99.52H1244z"
      />
      <path
        opacity=".2"
        d="M1192.167,777.5v889.978c-0.002,12.287-2.47,24.449-7.257,35.765 c-14.634,35.541-49.163,58.833-87.598,59.09H691.975c-8.812-17.105-17.105-34.21-24.362-51.833 c-7.257-17.623-12.958-34.21-18.142-51.833c-18.144-59.476-27.402-121.307-27.472-183.49V877.02 c-1.246-53.659,41.198-98.19,94.855-99.52H1192.167z"
      />
      <path
        opacity=".2"
        d="M1192.167,777.5v786.312c-0.395,52.223-42.632,94.46-94.855,94.855h-447.84 c-18.144-59.476-27.402-121.307-27.472-183.49V877.02c-1.246-53.659,41.198-98.19,94.855-99.52H1192.167z"
      />
      <path
        opacity=".2"
        d="M1140.333,777.5v786.312c-0.395,52.223-42.632,94.46-94.855,94.855H649.472 c-18.144-59.476-27.402-121.307-27.472-183.49V877.02c-1.246-53.659,41.198-98.19,94.855-99.52H1140.333z"
      />
      <path
        opacity=".1"
        d="M1244,509.522v163.275c-8.812,0.518-17.105,1.037-25.917,1.037 c-8.812,0-17.105-0.518-25.917-1.037c-17.496-1.161-34.848-3.937-51.833-8.293c-104.963-24.857-191.679-98.469-233.25-198.003 c-7.153-16.715-12.706-34.071-16.587-51.833h258.648C1201.449,414.866,1243.801,457.217,1244,509.522z"
      />
      <path
        opacity=".2"
        d="M1192.167,561.355v111.442c-17.496-1.161-34.848-3.937-51.833-8.293 c-104.963-24.857-191.679-98.469-233.25-198.003h190.228C1149.616,466.699,1191.968,509.051,1192.167,561.355z"
      />
      <path
        opacity=".2"
        d="M1192.167,561.355v111.442c-17.496-1.161-34.848-3.937-51.833-8.293 c-104.963-24.857-191.679-98.469-233.25-198.003h190.228C1149.616,466.699,1191.968,509.051,1192.167,561.355z"
      />
      <path
        opacity=".2"
        d="M1140.333,561.355v103.148c-104.963-24.857-191.679-98.469-233.25-198.003 h138.395C1097.783,466.699,1140.134,509.051,1140.333,561.355z"
      />
      <linearGradient
        id="a"
        gradientUnits="userSpaceOnUse"
        x1="198.099"
        y1="1683.0726"
        x2="942.2344"
        y2="394.2607"
        gradientTransform="matrix(1 0 0 -1 0 2075.3333)"
      >
        <stop offset="0" stopColor="#5a62c3" />
        <stop offset=".5" stopColor="#4d55bd" />
        <stop offset="1" stopColor="#3940ab" />
      </linearGradient>
      <path
        fill="url(#a)"
        d="M95.01,466.5h950.312c52.473,0,95.01,42.538,95.01,95.01v950.312c0,52.473-42.538,95.01-95.01,95.01 H95.01c-52.473,0-95.01-42.538-95.01-95.01V561.51C0,509.038,42.538,466.5,95.01,466.5z"
      />
      <path
        fill="#FFF"
        d="M820.211,828.193H630.241v517.297H509.211V828.193H320.123V727.844h500.088V828.193z"
      />
    </svg>
  );
};
