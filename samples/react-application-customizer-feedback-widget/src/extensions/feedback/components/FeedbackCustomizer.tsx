import * as React from "react"
import { useEffect, useState } from "react"
import { BiMessageSquareDetail } from "react-icons/bi"
import { RiCloseCircleLine } from "react-icons/ri"
import { Text } from "@fluentui/react"

import styles from "./FeedbackCustomizer.module.scss"
import { SuccessPage } from "./SuccessPage"
import { getSP } from "../../../Configuration/PnPConfig"
import { SPFI } from "@pnp/sp"
import { Logger } from "@pnp/logging"

type CurrentUser = {
  name: string
  mailId: string
}

export default function FeedbackCustomizer(props) {
  const [open, setOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    name: "",
    mailId: "",
  })
  const [feedbackComment, setfeedbackComment] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successFlag, setSuccessFlag] = useState(false)
  const [currentsiteUrl, setSiteUrl] = useState("")
  const [isExiting, setIsExiting] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleBtnClose = () => {
    setOpen(false)
    setfeedbackComment("")
    setSuccessFlag(false)
    handleOpen() // Call handleOpen to show the popup again
  }

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setOpen(false)
      setIsExiting(false)
      setfeedbackComment("")
    }, 1500) // Changed from 900 to 1500 to match the new 1.5s duration
  }

  useEffect(() => {
    if (props.context) {
      setCurrentUser({
        name: props.context.pageContext.user.displayName,
        mailId: props.context.pageContext.user.email,
      })
    }
    // set current page siteurl
    let getpageUrl = window.location.href
    setSiteUrl(getpageUrl)
  }, [])

  const handleTextArea = (event) => {
    setfeedbackComment(event.target.value)
  }

  const handleFeedbackSubmit = async () => {
    let sp: SPFI = getSP()

    if (feedbackComment.trim() === "") {
      setErrorMessage("Comment can't be empty")
    } else if (feedbackComment.length < 30) {
      setErrorMessage("Comment should be at least 50 characters long")
    } else {
      await sp.web.lists
        .getByTitle("Feedbacks")
        .items.add({
          Employee_Name: currentUser.name,
          Employee_MailId: currentUser.mailId,
          Comment: feedbackComment,
        })
        .then((res) => {
          console.log("Message sent successfully")
        })
        .catch((err) => Logger.error(err))

      setErrorMessage("")
      setfeedbackComment("")
      setSuccessFlag(true)
    }
  }

  return (
    <>
      {currentsiteUrl.includes("viewlsts") ? (
        <div></div>
      ) : currentsiteUrl.includes("AllItems") ? (
        <div></div>
      ) : currentsiteUrl.includes("Forms") ? (
        <div></div>
      ) : (
        <div className={styles["feedback-widget-container"]}>
          <div
            className={styles["buttonWrapper"]}
            onClick={open ? handleClose : handleOpen}
          >
            <BiMessageSquareDetail
              style={{ width: "23px", height: "23px", paddingBottom: "4px" }}
            />
            <Text className={styles["text-style"]}>Feedback</Text>
          </div>
          {open && (
            <div
              className={`${styles["popup-container"]} ${
                isExiting ? styles["popup-container-exit"] : ""
              }`}
            >
              <div className={styles["header-container"]}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Submit your feedbacks & ideas
                </Text>
                <RiCloseCircleLine
                  style={{
                    cursor: "pointer",
                    color: "#fff",
                    width: "22px",
                    height: "22px",
                  }}
                  onClick={handleClose}
                />
              </div>
              {successFlag === false ? (
                <div className={styles["feedbackWrapper"]}>
                  <textarea
                    className={styles["textArea__style"]}
                    value={feedbackComment}
                    onChange={handleTextArea}
                    placeholder='Type here...'
                  ></textarea>
                  <p className={styles["errorTxt"]}>{errorMessage}</p>
                  <button
                    className={styles["submitbtn"]}
                    onClick={handleFeedbackSubmit}
                  >
                    Submit
                  </button>
                </div>
              ) : (
                <SuccessPage goBack={handleBtnClose} />
              )}
              <div className={styles["downarrow"]}></div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
