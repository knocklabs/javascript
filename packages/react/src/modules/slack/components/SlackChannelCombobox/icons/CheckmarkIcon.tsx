const CheckmarkIcon = ({ isConnected }: { isConnected: boolean }) => (
  <svg
    width="14"
    height="15"
    viewBox="0 0 14 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.3751 3.9996L5.25006 10.9996L2.62506 8.3746"
      stroke={isConnected ? "#5469D4" : "#A5ACB8"}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export default CheckmarkIcon;
