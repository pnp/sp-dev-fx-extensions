import * as React from "react"
import { useEffect, useState } from "react"
import { BiMessageSquareDetail } from "react-icons/bi"
import { RiCloseCircleLine } from "react-icons/ri"
import styles from "./FeedbackCustomizer.module.scss"
import { SuccessPage } from "./SuccessPage"
import { getSP } from "../../../Configuration/PnPConfig"
import { SPFI } from "@pnp/sp"
import {
  FluentProvider,
  IdPrefixProvider,
  Textarea,
  webLightTheme,
  Text,
  Rating,
} from "@fluentui/react-components"

type CurrentUser = {
  name: string
  mailId: string
}

interface IFeedbackCustomizerProps {
  context: any
  properties: any
}

export default function FeedbackCustomizer({
  context,
  properties,
}: IFeedbackCustomizerProps) {
  const [open, setOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    name: "",
    mailId: "",
  })
  const [feedbackComment, setfeedbackComment] = useState("")
  const [currentRating, setCurrentRating] = useState<any>(0)
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
    if (context) {
      setCurrentUser({
        name: context.pageContext.user.displayName,
        mailId: context.pageContext.user.email,
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
      let data = await sp.web.lists.getByTitle("Feedbacks").items.add({
        Employee_Name: currentUser.name,
        Employee_MailId: currentUser.mailId,
        Comment: feedbackComment,
      })

      if (currentRating > 0) {
        const item = sp.web.lists.getByTitle("Feedbacks").items.getById(data.ID)

        // rate an item
        await item.rate(currentRating)
      }

      setErrorMessage("")
      setfeedbackComment("")
      setCurrentRating(0)
      setSuccessFlag(true)
    }
  }

  return (
    <IdPrefixProvider value='feedback-customizer-'>
      <FluentProvider theme={webLightTheme}>
        {currentsiteUrl.includes("viewlsts") ? (
          <div></div>
        ) : currentsiteUrl.includes("AllItems") ? (
          <div></div>
        ) : currentsiteUrl.includes("Forms") ? (
          <div></div>
        ) : (
          <div
            className={`${styles["feedback-widget-container"]} ${
              properties.position === "leftBottom"
                ? styles["widget-left"]
                : styles["widget-right"]
            }`}
          >
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
                } ${
                  properties.position === "leftBottom"
                    ? styles["popup-left"]
                    : ""
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
                    {properties.title}
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
                    <Textarea
                      className={styles["textArea__style"]}
                      value={feedbackComment}
                      onChange={(event) => handleTextArea(event)}
                      placeholder='Type here...'
                    ></Textarea>
                    {errorMessage && (
                      <p className={styles["errorTxt"]}>{errorMessage}</p>
                    )}
                    <Rating
                      value={currentRating}
                      color='marigold'
                      max={5}
                      onChange={(_, data) => setCurrentRating(data.value)}
                    />
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
                <div
                  className={`${styles["downarrow"]} ${
                    properties.position === "leftBottom"
                      ? styles["downarrow-left"]
                      : ""
                  }`}
                ></div>
              </div>
            )}
          </div>
        )}
      </FluentProvider>
    </IdPrefixProvider>
  )
}
