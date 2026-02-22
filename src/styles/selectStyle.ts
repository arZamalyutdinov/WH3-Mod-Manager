const selectStyle = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  control: (base: any, state: any) => ({
    ...base,
    background: "#2b3340",
    minHeight: 38,
    borderRadius: 10,
    borderColor: state.isFocused ? "#5f9bff" : "#4d5562",
    boxShadow: state.isFocused ? "0 0 0 1px #5f9bff" : "none",
    transition: "border-color 120ms ease, box-shadow 120ms ease",
    "&:hover": {
      borderColor: "#6ea8ff",
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  menu: (base: any) => ({
    ...base,
    background: "#2b3340",
    marginTop: 0,
    border: "1px solid #5f9bff",
    borderTop: "none",
    borderRadius: "0 0 10px 10px",
    overflow: "hidden",
    boxShadow: "0 20px 35px rgba(0, 0, 0, 0.35)",
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: (base: any, state: any) => ({
    ...base,
    background: state.isSelected ? "#285bba" : state.isFocused ? "#3b4a5b" : "#2b3340",
    color: "#f1f5f9",
    cursor: "pointer",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#f1f5f9",
  }),
  input: (base: any) => ({
    ...base,
    color: "#f1f5f9",
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 320,
  }),
  menuList: (base: any) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
  }),
};

export default selectStyle;
