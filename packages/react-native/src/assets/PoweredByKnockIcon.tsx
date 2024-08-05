import React from "react";
import { ViewStyle, useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useTheme } from "../theme/useTheme";

type PoweredByKnockIconProps = {
  width?: number;
  height?: number;
  style?: ViewStyle;
};

const PoweredByKnockIcon: React.FC<PoweredByKnockIconProps> = ({
  width = 152,
  height = 28,
  style,
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  if (colorScheme === "dark") {
    return (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 152 28"
        fill="none"
        style={style}
      >
        <Path
          d="M0.5 14C0.5 6.54416 6.54416 0.5 14 0.5H137.831C145.287 0.5 151.331 6.54416 151.331 14C151.331 21.4558 145.287 27.5 137.831 27.5H14C6.54415 27.5 0.5 21.4558 0.5 14Z"
          fill="#18191B"
        />
        <Path
          d="M0.5 14C0.5 6.54416 6.54416 0.5 14 0.5H137.831C145.287 0.5 151.331 6.54416 151.331 14C151.331 21.4558 145.287 27.5 137.831 27.5H14C6.54415 27.5 0.5 21.4558 0.5 14Z"
          stroke="#272A2D"
        />
        <Path
          d="M13.1186 19V8.81818H16.7479C17.54 8.81818 18.1963 8.96236 18.7166 9.25071C19.237 9.53906 19.6264 9.93347 19.8849 10.4339C20.1435 10.9311 20.2727 11.4912 20.2727 12.1143C20.2727 12.7408 20.1418 13.3042 19.88 13.8047C19.6214 14.3018 19.2304 14.6963 18.7067 14.9879C18.1863 15.2763 17.5317 15.4205 16.7429 15.4205H14.2472V14.1179H16.6037C17.1042 14.1179 17.5102 14.0317 17.8217 13.8594C18.1333 13.6837 18.362 13.4451 18.5078 13.1435C18.6536 12.8419 18.7266 12.4988 18.7266 12.1143C18.7266 11.7299 18.6536 11.3885 18.5078 11.0902C18.362 10.7919 18.1316 10.5582 17.8168 10.3892C17.5052 10.2202 17.0942 10.1357 16.5838 10.1357H14.6548V19H13.1186ZM25.0753 19.1541C24.3594 19.1541 23.7346 18.9901 23.201 18.6619C22.6674 18.3338 22.2531 17.8748 21.9581 17.2848C21.6631 16.6948 21.5156 16.0054 21.5156 15.2166C21.5156 14.4245 21.6631 13.7318 21.9581 13.1385C22.2531 12.5452 22.6674 12.0845 23.201 11.7564C23.7346 11.4283 24.3594 11.2642 25.0753 11.2642C25.7912 11.2642 26.416 11.4283 26.9496 11.7564C27.4832 12.0845 27.8975 12.5452 28.1925 13.1385C28.4875 13.7318 28.6349 14.4245 28.6349 15.2166C28.6349 16.0054 28.4875 16.6948 28.1925 17.2848C27.8975 17.8748 27.4832 18.3338 26.9496 18.6619C26.416 18.9901 25.7912 19.1541 25.0753 19.1541ZM25.0803 17.9062C25.5443 17.9062 25.9287 17.7836 26.2337 17.5384C26.5386 17.2931 26.764 16.9666 26.9098 16.5589C27.0589 16.1513 27.1335 15.7022 27.1335 15.2116C27.1335 14.7244 27.0589 14.277 26.9098 13.8693C26.764 13.4583 26.5386 13.1286 26.2337 12.88C25.9287 12.6314 25.5443 12.5071 25.0803 12.5071C24.6129 12.5071 24.2251 12.6314 23.9169 12.88C23.612 13.1286 23.3849 13.4583 23.2358 13.8693C23.09 14.277 23.017 14.7244 23.017 15.2116C23.017 15.7022 23.09 16.1513 23.2358 16.5589C23.3849 16.9666 23.612 17.2931 23.9169 17.5384C24.2251 17.7836 24.6129 17.9062 25.0803 17.9062ZM31.7173 19L29.4702 11.3636H31.0064L32.5028 16.9716H32.5774L34.0788 11.3636H35.6151L37.1065 16.9467H37.1811L38.6676 11.3636H40.2038L37.9616 19H36.4453L34.8942 13.4865H34.7798L33.2287 19H31.7173ZM44.6733 19.1541C43.9209 19.1541 43.273 18.9934 42.7294 18.6719C42.1892 18.3471 41.7715 17.8913 41.4766 17.3047C41.1849 16.7147 41.0391 16.0237 41.0391 15.2315C41.0391 14.4493 41.1849 13.7599 41.4766 13.1634C41.7715 12.5668 42.1825 12.1011 42.7095 11.7663C43.2398 11.4316 43.8596 11.2642 44.5689 11.2642C44.9998 11.2642 45.4174 11.3355 45.8217 11.478C46.2261 11.6205 46.589 11.8442 46.9105 12.1491C47.232 12.4541 47.4856 12.8501 47.6712 13.3374C47.8568 13.8213 47.9496 14.4096 47.9496 15.1023V15.6293H41.8793V14.5156H46.4929C46.4929 14.1245 46.4134 13.7782 46.2543 13.4766C46.0952 13.1716 45.8714 12.9313 45.5831 12.7557C45.2981 12.58 44.9633 12.4922 44.5788 12.4922C44.1612 12.4922 43.7966 12.5949 43.4851 12.8004C43.1768 13.0026 42.9382 13.2678 42.7692 13.5959C42.6035 13.9207 42.5206 14.2737 42.5206 14.6548V15.5249C42.5206 16.0353 42.6101 16.4695 42.7891 16.8274C42.9714 17.1854 43.2249 17.4588 43.5497 17.6477C43.8745 17.8333 44.254 17.9261 44.6882 17.9261C44.9699 17.9261 45.2268 17.8864 45.4588 17.8068C45.6908 17.724 45.8913 17.6013 46.0604 17.4389C46.2294 17.2765 46.3587 17.076 46.4482 16.8374L47.8551 17.0909C47.7424 17.5052 47.5402 17.8681 47.2486 18.1797C46.9602 18.4879 46.5973 18.7282 46.1598 18.9006C45.7256 19.0696 45.2301 19.1541 44.6733 19.1541ZM49.5989 19V11.3636H51.0357V12.5767H51.1152C51.2544 12.1657 51.4997 11.8426 51.851 11.6072C52.2057 11.3686 52.6067 11.2493 53.0542 11.2493C53.147 11.2493 53.2563 11.2526 53.3823 11.2592C53.5115 11.2659 53.6126 11.2741 53.6855 11.2841V12.706C53.6259 12.6894 53.5198 12.6712 53.3674 12.6513C53.2149 12.6281 53.0624 12.6165 52.91 12.6165C52.5587 12.6165 52.2454 12.6911 51.9703 12.8402C51.6986 12.986 51.4831 13.1899 51.324 13.4517C51.165 13.7102 51.0854 14.0052 51.0854 14.3366V19H49.5989ZM57.9897 19.1541C57.2373 19.1541 56.5894 18.9934 56.0458 18.6719C55.5056 18.3471 55.0879 17.8913 54.793 17.3047C54.5013 16.7147 54.3555 16.0237 54.3555 15.2315C54.3555 14.4493 54.5013 13.7599 54.793 13.1634C55.0879 12.5668 55.4989 12.1011 56.0259 11.7663C56.5562 11.4316 57.176 11.2642 57.8853 11.2642C58.3162 11.2642 58.7338 11.3355 59.1381 11.478C59.5425 11.6205 59.9054 11.8442 60.2269 12.1491C60.5484 12.4541 60.802 12.8501 60.9876 13.3374C61.1732 13.8213 61.266 14.4096 61.266 15.1023V15.6293H55.1957V14.5156H59.8093C59.8093 14.1245 59.7298 13.7782 59.5707 13.4766C59.4116 13.1716 59.1879 12.9313 58.8995 12.7557C58.6145 12.58 58.2797 12.4922 57.8952 12.4922C57.4776 12.4922 57.113 12.5949 56.8015 12.8004C56.4933 13.0026 56.2546 13.2678 56.0856 13.5959C55.9199 13.9207 55.837 14.2737 55.837 14.6548V15.5249C55.837 16.0353 55.9265 16.4695 56.1055 16.8274C56.2878 17.1854 56.5413 17.4588 56.8661 17.6477C57.1909 17.8333 57.5704 17.9261 58.0046 17.9261C58.2863 17.9261 58.5432 17.8864 58.7752 17.8068C59.0072 17.724 59.2077 17.6013 59.3768 17.4389C59.5458 17.2765 59.6751 17.076 59.7646 16.8374L61.1715 17.0909C61.0588 17.5052 60.8567 17.8681 60.565 18.1797C60.2766 18.4879 59.9137 18.7282 59.4762 18.9006C59.042 19.0696 58.5465 19.1541 57.9897 19.1541ZM65.774 19.1491C65.1575 19.1491 64.6073 18.9917 64.1234 18.6768C63.6428 18.3587 63.265 17.9062 62.9899 17.3196C62.7181 16.7296 62.5822 16.022 62.5822 15.1967C62.5822 14.3714 62.7198 13.6655 62.9949 13.0788C63.2733 12.4922 63.6544 12.0431 64.1383 11.7315C64.6222 11.42 65.1708 11.2642 65.7839 11.2642C66.2579 11.2642 66.639 11.3438 66.9274 11.5028C67.219 11.6586 67.4444 11.8409 67.6035 12.0497C67.7659 12.2585 67.8919 12.4425 67.9814 12.6016H68.0708V8.81818H69.5574V19H68.1056V17.8118H67.9814C67.8919 17.9742 67.7626 18.1598 67.5936 18.3686C67.4279 18.5774 67.1992 18.7597 66.9075 18.9155C66.6158 19.0713 66.238 19.1491 65.774 19.1491ZM66.1021 17.8814C66.5297 17.8814 66.8909 17.7687 67.1859 17.5433C67.4842 17.3146 67.7096 16.9981 67.862 16.5938C68.0178 16.1894 68.0957 15.7187 68.0957 15.1818C68.0957 14.6515 68.0195 14.1875 67.867 13.7898C67.7145 13.392 67.4908 13.0821 67.1958 12.8601C66.9009 12.638 66.5363 12.527 66.1021 12.527C65.6547 12.527 65.2818 12.643 64.9835 12.875C64.6852 13.107 64.4598 13.4235 64.3074 13.8246C64.1582 14.2256 64.0836 14.678 64.0836 15.1818C64.0836 15.6922 64.1599 16.1513 64.3123 16.5589C64.4648 16.9666 64.6902 17.2898 64.9885 17.5284C65.2901 17.7637 65.6613 17.8814 66.1021 17.8814ZM75.5034 19V8.81818H76.9899V12.6016H77.0794C77.1655 12.4425 77.2898 12.2585 77.4522 12.0497C77.6146 11.8409 77.84 11.6586 78.1284 11.5028C78.4167 11.3438 78.7979 11.2642 79.2718 11.2642C79.8883 11.2642 80.4385 11.42 80.9224 11.7315C81.4063 12.0431 81.7858 12.4922 82.0609 13.0788C82.3393 13.6655 82.4785 14.3714 82.4785 15.1967C82.4785 16.022 82.341 16.7296 82.0659 17.3196C81.7908 17.9062 81.4129 18.3587 80.9324 18.6768C80.4518 18.9917 79.9032 19.1491 79.2868 19.1491C78.8227 19.1491 78.4432 19.0713 78.1483 18.9155C77.8566 18.7597 77.6279 18.5774 77.4622 18.3686C77.2965 18.1598 77.1689 17.9742 77.0794 17.8118H76.9551V19H75.5034ZM76.96 15.1818C76.96 15.7187 77.0379 16.1894 77.1937 16.5938C77.3495 16.9981 77.5749 17.3146 77.8699 17.5433C78.1648 17.7687 78.5261 17.8814 78.9537 17.8814C79.3978 17.8814 79.769 17.7637 80.0673 17.5284C80.3656 17.2898 80.591 16.9666 80.7434 16.5589C80.8992 16.1513 80.9771 15.6922 80.9771 15.1818C80.9771 14.678 80.9009 14.2256 80.7484 13.8246C80.5993 13.4235 80.3739 13.107 80.0723 12.875C79.774 12.643 79.4011 12.527 78.9537 12.527C78.5228 12.527 78.1582 12.638 77.8599 12.8601C77.5649 13.0821 77.3412 13.392 77.1887 13.7898C77.0363 14.1875 76.96 14.6515 76.96 15.1818ZM84.8276 21.8636C84.6055 21.8636 84.4033 21.8454 84.2211 21.8089C84.0388 21.7758 83.9029 21.7393 83.8134 21.6996L84.1713 20.4815C84.4431 20.5545 84.6851 20.5859 84.8972 20.576C85.1093 20.5661 85.2966 20.4865 85.459 20.3374C85.6247 20.1882 85.7705 19.9446 85.8965 19.6065L86.0804 19.0994L83.2864 11.3636H84.8773L86.8113 17.2898H86.8908L88.8248 11.3636H90.4206L87.2736 20.0192C87.1278 20.4169 86.9422 20.7533 86.7168 21.0284C86.4914 21.3068 86.223 21.5156 85.9114 21.6548C85.5998 21.794 85.2386 21.8636 84.8276 21.8636Z"
          fill="#EDEEF0"
        />
        <Path
          d="M96 18.9973V6.67108H98.5145V13.7398H98.5848L101.345 10.2758H104.159L101.099 13.8629L104.387 18.9973H101.592L99.6223 15.6036L98.5145 16.8521V18.9973H96Z"
          fill="#EDEEF0"
        />
        <Path
          d="M104.93 18.9973V10.2758H107.04L107.216 11.3835H107.286C107.661 11.0319 108.072 10.7271 108.517 10.4692C108.962 10.1996 109.484 10.0648 110.082 10.0648C111.032 10.0648 111.717 10.3754 112.139 10.9967C112.573 11.618 112.79 12.4796 112.79 13.5815V18.9973H110.205V13.9156C110.205 13.2826 110.117 12.8489 109.941 12.6144C109.777 12.38 109.508 12.2627 109.132 12.2627C108.804 12.2627 108.523 12.3389 108.288 12.4913C108.054 12.632 107.796 12.8371 107.515 13.1067V18.9973H104.93Z"
          fill="#EDEEF0"
        />
        <Path
          d="M118.035 19.2083C117.484 19.2083 116.95 19.1087 116.434 18.9094C115.919 18.6984 115.461 18.3995 115.063 18.0126C114.676 17.6258 114.365 17.151 114.131 16.5883C113.896 16.0139 113.779 15.3633 113.779 14.6365C113.779 13.9097 113.896 13.265 114.131 12.7023C114.365 12.1279 114.676 11.6473 115.063 11.2604C115.461 10.8736 115.919 10.5805 116.434 10.3813C116.95 10.1703 117.484 10.0648 118.035 10.0648C118.586 10.0648 119.113 10.1703 119.617 10.3813C120.133 10.5805 120.584 10.8736 120.971 11.2604C121.37 11.6473 121.686 12.1279 121.921 12.7023C122.155 13.265 122.272 13.9097 122.272 14.6365C122.272 15.3633 122.155 16.0139 121.921 16.5883C121.686 17.151 121.37 17.6258 120.971 18.0126C120.584 18.3995 120.133 18.6984 119.617 18.9094C119.113 19.1087 118.586 19.2083 118.035 19.2083ZM118.035 17.1159C118.562 17.1159 118.961 16.8931 119.23 16.4477C119.5 16.0022 119.635 15.3985 119.635 14.6365C119.635 13.8746 119.5 13.2709 119.23 12.8254C118.961 12.38 118.562 12.1572 118.035 12.1572C117.495 12.1572 117.091 12.38 116.821 12.8254C116.563 13.2709 116.434 13.8746 116.434 14.6365C116.434 15.3985 116.563 16.0022 116.821 16.4477C117.091 16.8931 117.495 17.1159 118.035 17.1159Z"
          fill="#EDEEF0"
        />
        <Path
          d="M127.137 19.2083C126.528 19.2083 125.959 19.1087 125.432 18.9094C124.916 18.6984 124.465 18.3995 124.078 18.0126C123.691 17.6258 123.386 17.151 123.164 16.5883C122.941 16.0139 122.829 15.3633 122.829 14.6365C122.829 13.9097 122.953 13.265 123.199 12.7023C123.445 12.1279 123.773 11.6473 124.183 11.2604C124.605 10.8736 125.092 10.5805 125.643 10.3813C126.194 10.1703 126.768 10.0648 127.366 10.0648C127.905 10.0648 128.38 10.1527 128.79 10.3285C129.212 10.5043 129.587 10.7271 129.916 10.9967L128.702 12.6672C128.292 12.3272 127.899 12.1572 127.524 12.1572C126.891 12.1572 126.393 12.38 126.03 12.8254C125.666 13.2709 125.485 13.8746 125.485 14.6365C125.485 15.3985 125.666 16.0022 126.03 16.4477C126.405 16.8931 126.874 17.1159 127.436 17.1159C127.718 17.1159 127.987 17.0572 128.245 16.94C128.515 16.8111 128.767 16.6587 129.001 16.4828L130.021 18.1709C129.587 18.546 129.119 18.8156 128.614 18.9797C128.11 19.1321 127.618 19.2083 127.137 19.2083Z"
          fill="#EDEEF0"
        />
        <Path
          d="M130.844 18.9973V6.67108H133.359V13.7398H133.429L136.19 10.2758H139.003L135.943 13.8629L139.232 18.9973H136.436L134.466 15.6036L133.359 16.8521V18.9973H130.844Z"
          fill="#EDEEF0"
        />
        <Path
          d="M139.831 7.27478C139.831 8.41606 138.906 9.34125 137.764 9.34125C136.623 9.34125 135.698 8.41606 135.698 7.27478C135.698 6.1335 136.623 5.20831 137.764 5.20831C138.906 5.20831 139.831 6.1335 139.831 7.27478Z"
          fill="#E54D2E"
        />
      </Svg>
    );
  } else {
    return (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 152 28"
        fill="none"
        style={style}
      >
        <Path
          d="M14 0.5H137.831C145.287 0.5 151.331 6.54416 151.331 14C151.331 21.4558 145.287 27.5 137.831 27.5H14C6.54415 27.5 0.5 21.4558 0.5 14C0.5 6.54416 6.54416 0.5 14 0.5Z"
          fill="white"
        />
        <Path
          d="M14 0.5H137.831C145.287 0.5 151.331 6.54416 151.331 14C151.331 21.4558 145.287 27.5 137.831 27.5H14C6.54415 27.5 0.5 21.4558 0.5 14C0.5 6.54416 6.54416 0.5 14 0.5Z"
          stroke="#E8E8EC"
        />
        <Path
          d="M13.1186 19V8.81818H16.7479C17.54 8.81818 18.1963 8.96236 18.7166 9.25071C19.237 9.53906 19.6264 9.93347 19.8849 10.4339C20.1435 10.9311 20.2727 11.4912 20.2727 12.1143C20.2727 12.7408 20.1418 13.3042 19.88 13.8047C19.6214 14.3018 19.2304 14.6963 18.7067 14.9879C18.1863 15.2763 17.5317 15.4205 16.7429 15.4205H14.2472V14.1179H16.6037C17.1042 14.1179 17.5102 14.0317 17.8217 13.8594C18.1333 13.6837 18.362 13.4451 18.5078 13.1435C18.6536 12.8419 18.7266 12.4988 18.7266 12.1143C18.7266 11.7299 18.6536 11.3885 18.5078 11.0902C18.362 10.7919 18.1316 10.5582 17.8168 10.3892C17.5052 10.2202 17.0942 10.1357 16.5838 10.1357H14.6548V19H13.1186ZM25.0753 19.1541C24.3594 19.1541 23.7346 18.9901 23.201 18.6619C22.6674 18.3338 22.2531 17.8748 21.9581 17.2848C21.6631 16.6948 21.5156 16.0054 21.5156 15.2166C21.5156 14.4245 21.6631 13.7318 21.9581 13.1385C22.2531 12.5452 22.6674 12.0845 23.201 11.7564C23.7346 11.4283 24.3594 11.2642 25.0753 11.2642C25.7912 11.2642 26.416 11.4283 26.9496 11.7564C27.4832 12.0845 27.8975 12.5452 28.1925 13.1385C28.4875 13.7318 28.6349 14.4245 28.6349 15.2166C28.6349 16.0054 28.4875 16.6948 28.1925 17.2848C27.8975 17.8748 27.4832 18.3338 26.9496 18.6619C26.416 18.9901 25.7912 19.1541 25.0753 19.1541ZM25.0803 17.9062C25.5443 17.9062 25.9287 17.7836 26.2337 17.5384C26.5386 17.2931 26.764 16.9666 26.9098 16.5589C27.0589 16.1513 27.1335 15.7022 27.1335 15.2116C27.1335 14.7244 27.0589 14.277 26.9098 13.8693C26.764 13.4583 26.5386 13.1286 26.2337 12.88C25.9287 12.6314 25.5443 12.5071 25.0803 12.5071C24.6129 12.5071 24.2251 12.6314 23.9169 12.88C23.612 13.1286 23.3849 13.4583 23.2358 13.8693C23.09 14.277 23.017 14.7244 23.017 15.2116C23.017 15.7022 23.09 16.1513 23.2358 16.5589C23.3849 16.9666 23.612 17.2931 23.9169 17.5384C24.2251 17.7836 24.6129 17.9062 25.0803 17.9062ZM31.7173 19L29.4702 11.3636H31.0064L32.5028 16.9716H32.5774L34.0788 11.3636H35.6151L37.1065 16.9467H37.1811L38.6676 11.3636H40.2038L37.9616 19H36.4453L34.8942 13.4865H34.7798L33.2287 19H31.7173ZM44.6733 19.1541C43.9209 19.1541 43.273 18.9934 42.7294 18.6719C42.1892 18.3471 41.7715 17.8913 41.4766 17.3047C41.1849 16.7147 41.0391 16.0237 41.0391 15.2315C41.0391 14.4493 41.1849 13.7599 41.4766 13.1634C41.7715 12.5668 42.1825 12.1011 42.7095 11.7663C43.2398 11.4316 43.8596 11.2642 44.5689 11.2642C44.9998 11.2642 45.4174 11.3355 45.8217 11.478C46.2261 11.6205 46.589 11.8442 46.9105 12.1491C47.232 12.4541 47.4856 12.8501 47.6712 13.3374C47.8568 13.8213 47.9496 14.4096 47.9496 15.1023V15.6293H41.8793V14.5156H46.4929C46.4929 14.1245 46.4134 13.7782 46.2543 13.4766C46.0952 13.1716 45.8714 12.9313 45.5831 12.7557C45.2981 12.58 44.9633 12.4922 44.5788 12.4922C44.1612 12.4922 43.7966 12.5949 43.4851 12.8004C43.1768 13.0026 42.9382 13.2678 42.7692 13.5959C42.6035 13.9207 42.5206 14.2737 42.5206 14.6548V15.5249C42.5206 16.0353 42.6101 16.4695 42.7891 16.8274C42.9714 17.1854 43.2249 17.4588 43.5497 17.6477C43.8745 17.8333 44.254 17.9261 44.6882 17.9261C44.9699 17.9261 45.2268 17.8864 45.4588 17.8068C45.6908 17.724 45.8913 17.6013 46.0604 17.4389C46.2294 17.2765 46.3587 17.076 46.4482 16.8374L47.8551 17.0909C47.7424 17.5052 47.5402 17.8681 47.2486 18.1797C46.9602 18.4879 46.5973 18.7282 46.1598 18.9006C45.7256 19.0696 45.2301 19.1541 44.6733 19.1541ZM49.5989 19V11.3636H51.0357V12.5767H51.1152C51.2544 12.1657 51.4997 11.8426 51.851 11.6072C52.2057 11.3686 52.6067 11.2493 53.0542 11.2493C53.147 11.2493 53.2563 11.2526 53.3823 11.2592C53.5115 11.2659 53.6126 11.2741 53.6855 11.2841V12.706C53.6259 12.6894 53.5198 12.6712 53.3674 12.6513C53.2149 12.6281 53.0624 12.6165 52.91 12.6165C52.5587 12.6165 52.2454 12.6911 51.9703 12.8402C51.6986 12.986 51.4831 13.1899 51.324 13.4517C51.165 13.7102 51.0854 14.0052 51.0854 14.3366V19H49.5989ZM57.9897 19.1541C57.2373 19.1541 56.5894 18.9934 56.0458 18.6719C55.5056 18.3471 55.0879 17.8913 54.793 17.3047C54.5013 16.7147 54.3555 16.0237 54.3555 15.2315C54.3555 14.4493 54.5013 13.7599 54.793 13.1634C55.0879 12.5668 55.4989 12.1011 56.0259 11.7663C56.5562 11.4316 57.176 11.2642 57.8853 11.2642C58.3162 11.2642 58.7338 11.3355 59.1381 11.478C59.5425 11.6205 59.9054 11.8442 60.2269 12.1491C60.5484 12.4541 60.802 12.8501 60.9876 13.3374C61.1732 13.8213 61.266 14.4096 61.266 15.1023V15.6293H55.1957V14.5156H59.8093C59.8093 14.1245 59.7298 13.7782 59.5707 13.4766C59.4116 13.1716 59.1879 12.9313 58.8995 12.7557C58.6145 12.58 58.2797 12.4922 57.8952 12.4922C57.4776 12.4922 57.113 12.5949 56.8015 12.8004C56.4933 13.0026 56.2546 13.2678 56.0856 13.5959C55.9199 13.9207 55.837 14.2737 55.837 14.6548V15.5249C55.837 16.0353 55.9265 16.4695 56.1055 16.8274C56.2878 17.1854 56.5413 17.4588 56.8661 17.6477C57.1909 17.8333 57.5704 17.9261 58.0046 17.9261C58.2863 17.9261 58.5432 17.8864 58.7752 17.8068C59.0072 17.724 59.2077 17.6013 59.3768 17.4389C59.5458 17.2765 59.6751 17.076 59.7646 16.8374L61.1715 17.0909C61.0588 17.5052 60.8567 17.8681 60.565 18.1797C60.2766 18.4879 59.9137 18.7282 59.4762 18.9006C59.042 19.0696 58.5465 19.1541 57.9897 19.1541ZM65.774 19.1491C65.1575 19.1491 64.6073 18.9917 64.1234 18.6768C63.6428 18.3587 63.265 17.9062 62.9899 17.3196C62.7181 16.7296 62.5822 16.022 62.5822 15.1967C62.5822 14.3714 62.7198 13.6655 62.9949 13.0788C63.2733 12.4922 63.6544 12.0431 64.1383 11.7315C64.6222 11.42 65.1708 11.2642 65.7839 11.2642C66.2579 11.2642 66.639 11.3438 66.9274 11.5028C67.219 11.6586 67.4444 11.8409 67.6035 12.0497C67.7659 12.2585 67.8919 12.4425 67.9814 12.6016H68.0708V8.81818H69.5574V19H68.1056V17.8118H67.9814C67.8919 17.9742 67.7626 18.1598 67.5936 18.3686C67.4279 18.5774 67.1992 18.7597 66.9075 18.9155C66.6158 19.0713 66.238 19.1491 65.774 19.1491ZM66.1021 17.8814C66.5297 17.8814 66.8909 17.7687 67.1859 17.5433C67.4842 17.3146 67.7096 16.9981 67.862 16.5938C68.0178 16.1894 68.0957 15.7187 68.0957 15.1818C68.0957 14.6515 68.0195 14.1875 67.867 13.7898C67.7145 13.392 67.4908 13.0821 67.1958 12.8601C66.9009 12.638 66.5363 12.527 66.1021 12.527C65.6547 12.527 65.2818 12.643 64.9835 12.875C64.6852 13.107 64.4598 13.4235 64.3074 13.8246C64.1582 14.2256 64.0836 14.678 64.0836 15.1818C64.0836 15.6922 64.1599 16.1513 64.3123 16.5589C64.4648 16.9666 64.6902 17.2898 64.9885 17.5284C65.2901 17.7637 65.6613 17.8814 66.1021 17.8814ZM75.5034 19V8.81818H76.9899V12.6016H77.0794C77.1655 12.4425 77.2898 12.2585 77.4522 12.0497C77.6146 11.8409 77.84 11.6586 78.1284 11.5028C78.4167 11.3438 78.7979 11.2642 79.2718 11.2642C79.8883 11.2642 80.4385 11.42 80.9224 11.7315C81.4063 12.0431 81.7858 12.4922 82.0609 13.0788C82.3393 13.6655 82.4785 14.3714 82.4785 15.1967C82.4785 16.022 82.341 16.7296 82.0659 17.3196C81.7908 17.9062 81.4129 18.3587 80.9324 18.6768C80.4518 18.9917 79.9032 19.1491 79.2868 19.1491C78.8227 19.1491 78.4432 19.0713 78.1483 18.9155C77.8566 18.7597 77.6279 18.5774 77.4622 18.3686C77.2965 18.1598 77.1689 17.9742 77.0794 17.8118H76.9551V19H75.5034ZM76.96 15.1818C76.96 15.7187 77.0379 16.1894 77.1937 16.5938C77.3495 16.9981 77.5749 17.3146 77.8699 17.5433C78.1648 17.7687 78.5261 17.8814 78.9537 17.8814C79.3978 17.8814 79.769 17.7637 80.0673 17.5284C80.3656 17.2898 80.591 16.9666 80.7434 16.5589C80.8992 16.1513 80.9771 15.6922 80.9771 15.1818C80.9771 14.678 80.9009 14.2256 80.7484 13.8246C80.5993 13.4235 80.3739 13.107 80.0723 12.875C79.774 12.643 79.4011 12.527 78.9537 12.527C78.5228 12.527 78.1582 12.638 77.8599 12.8601C77.5649 13.0821 77.3412 13.392 77.1887 13.7898C77.0363 14.1875 76.96 14.6515 76.96 15.1818ZM84.8276 21.8636C84.6055 21.8636 84.4033 21.8454 84.2211 21.8089C84.0388 21.7758 83.9029 21.7393 83.8134 21.6996L84.1713 20.4815C84.4431 20.5545 84.6851 20.5859 84.8972 20.576C85.1093 20.5661 85.2966 20.4865 85.459 20.3374C85.6247 20.1882 85.7705 19.9446 85.8965 19.6065L86.0804 19.0994L83.2864 11.3636H84.8773L86.8113 17.2898H86.8908L88.8248 11.3636H90.4206L87.2736 20.0192C87.1278 20.4169 86.9422 20.7533 86.7168 21.0284C86.4914 21.3068 86.223 21.5156 85.9114 21.6548C85.5998 21.794 85.2386 21.8636 84.8276 21.8636Z"
          fill="#1C2024"
        />
        <Path
          d="M96 18.9973V6.67108H98.5145V13.7398H98.5848L101.345 10.2758H104.159L101.099 13.8629L104.387 18.9973H101.592L99.6223 15.6036L98.5145 16.8521V18.9973H96Z"
          fill="#1C2024"
        />
        <Path
          d="M104.93 18.9973V10.2758H107.04L107.216 11.3835H107.286C107.661 11.0319 108.072 10.7271 108.517 10.4692C108.962 10.1996 109.484 10.0648 110.082 10.0648C111.032 10.0648 111.717 10.3754 112.139 10.9967C112.573 11.618 112.79 12.4796 112.79 13.5815V18.9973H110.205V13.9156C110.205 13.2826 110.117 12.8489 109.941 12.6144C109.777 12.38 109.508 12.2627 109.132 12.2627C108.804 12.2627 108.523 12.3389 108.288 12.4913C108.054 12.632 107.796 12.8371 107.515 13.1067V18.9973H104.93Z"
          fill="#1C2024"
        />
        <Path
          d="M118.035 19.2083C117.484 19.2083 116.95 19.1087 116.434 18.9094C115.919 18.6984 115.461 18.3995 115.063 18.0126C114.676 17.6258 114.365 17.151 114.131 16.5883C113.896 16.0139 113.779 15.3633 113.779 14.6365C113.779 13.9097 113.896 13.265 114.131 12.7023C114.365 12.1279 114.676 11.6473 115.063 11.2604C115.461 10.8736 115.919 10.5805 116.434 10.3813C116.95 10.1703 117.484 10.0648 118.035 10.0648C118.586 10.0648 119.113 10.1703 119.617 10.3813C120.133 10.5805 120.584 10.8736 120.971 11.2604C121.37 11.6473 121.686 12.1279 121.921 12.7023C122.155 13.265 122.272 13.9097 122.272 14.6365C122.272 15.3633 122.155 16.0139 121.921 16.5883C121.686 17.151 121.37 17.6258 120.971 18.0126C120.584 18.3995 120.133 18.6984 119.617 18.9094C119.113 19.1087 118.586 19.2083 118.035 19.2083ZM118.035 17.1159C118.562 17.1159 118.961 16.8931 119.23 16.4477C119.5 16.0022 119.635 15.3985 119.635 14.6365C119.635 13.8746 119.5 13.2709 119.23 12.8254C118.961 12.38 118.562 12.1572 118.035 12.1572C117.495 12.1572 117.091 12.38 116.821 12.8254C116.563 13.2709 116.434 13.8746 116.434 14.6365C116.434 15.3985 116.563 16.0022 116.821 16.4477C117.091 16.8931 117.495 17.1159 118.035 17.1159Z"
          fill="#1C2024"
        />
        <Path
          d="M127.137 19.2083C126.528 19.2083 125.959 19.1087 125.432 18.9094C124.916 18.6984 124.465 18.3995 124.078 18.0126C123.691 17.6258 123.386 17.151 123.164 16.5883C122.941 16.0139 122.829 15.3633 122.829 14.6365C122.829 13.9097 122.953 13.265 123.199 12.7023C123.445 12.1279 123.773 11.6473 124.183 11.2604C124.605 10.8736 125.092 10.5805 125.643 10.3813C126.194 10.1703 126.768 10.0648 127.366 10.0648C127.905 10.0648 128.38 10.1527 128.79 10.3285C129.212 10.5043 129.587 10.7271 129.916 10.9967L128.702 12.6672C128.292 12.3272 127.899 12.1572 127.524 12.1572C126.891 12.1572 126.393 12.38 126.03 12.8254C125.666 13.2709 125.485 13.8746 125.485 14.6365C125.485 15.3985 125.666 16.0022 126.03 16.4477C126.405 16.8931 126.874 17.1159 127.436 17.1159C127.718 17.1159 127.987 17.0572 128.245 16.94C128.515 16.8111 128.767 16.6587 129.001 16.4828L130.021 18.1709C129.587 18.546 129.119 18.8156 128.614 18.9797C128.11 19.1321 127.618 19.2083 127.137 19.2083Z"
          fill="#1C2024"
        />
        <Path
          d="M130.844 18.9973V6.67108H133.359V13.7398H133.429L136.19 10.2758H139.003L135.943 13.8629L139.232 18.9973H136.436L134.466 15.6036L133.359 16.8521V18.9973H130.844Z"
          fill="#1C2024"
        />
        <Path
          d="M139.831 7.27478C139.831 8.41606 138.906 9.34125 137.765 9.34125C136.623 9.34125 135.698 8.41606 135.698 7.27478C135.698 6.1335 136.623 5.20831 137.765 5.20831C138.906 5.20831 139.831 6.1335 139.831 7.27478Z"
          fill="#E54D2E"
        />
      </Svg>
    );
  }
};

export { PoweredByKnockIcon };

{
  /* <svg
  width="152"
  height="28"
  viewBox="0 0 152 28"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
> */
}
