interface Props {
  location: any;
}

function ResetPassword(props: Props) {
  const linkVal = props.location.state?.link_val;

  return (
    <>
      <div>The reset password page</div>
      <div>
        You need to pass this link value to the /auth/reset-password POST
        request: {linkVal}
      </div>
    </>
  );
}

export default ResetPassword;
