"use client";

import { useState, useEffect, useRef } from "react";
import ReactDropzone from "react-dropzone";
import toast, { Toaster } from "react-hot-toast";
import { IoLogoDropbox } from "react-icons/io";
import { IoCloudUploadSharp } from "react-icons/io5";
import { Action } from "@/types.d";
import bytesToSize from "@/utils/bytes-to-size";
import fileToIcon from "@/utils/file-to-icon";
import compressFileName from "@/utils/compress-file-name";
import convertFile from "@/utils/convert";
import loadFfmpeg from "@/utils/load-ffmpeg";
import { HiOutlineDownload } from "react-icons/hi";
import { BiError } from "react-icons/bi";
import { MdDone } from "react-icons/md";
import { ImSpinner3 } from "react-icons/im";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { MdClose } from "react-icons/md";

const extensions = {
  image: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "ico",
    "tif",
    "tiff",
    "svg",
    "raw",
    "tga",
  ],
  video: [
    "mp4",
    "m4v",
    "mp4v",
    "3gp",
    "3g2",
    "avi",
    "mov",
    "wmv",
    "mkv",
    "flv",
    "ogv",
    "webm",
    "h264",
    "264",
    "hevc",
    "265",
  ],
  audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"],
};

export default function Dropzone() {
  const [is_hover, setIsHover] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [is_ready, setIsReady] = useState<boolean>(false);
  const [files, setFiles] = useState<Array<any>>([]);
  const [is_loaded, setIsLoaded] = useState<boolean>(false);
  const [is_converting, setIsConverting] = useState<boolean>(false);
  const [is_done, setIsDone] = useState<boolean>(false);
  const ffmpegRef = useRef<any>(null);
  const [defaultValues, setDefaultValues] = useState<string>("video");
  const [selcted, setSelected] = useState<string>("...");
  const accepted_files = {
    "image/*": [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".ico",
      ".tif",
      ".tiff",
      ".raw",
      ".tga",
    ],
    "audio/*": [],
    "video/*": [],
  };

  // DropBox Designing
  const handleHover = (): void => setIsHover(true);
  const handleExitHover = (): void => setIsHover(false);
  const handleUpload = (data: Array<any>): void => {
    handleExitHover();
    setFiles((prevdata) => [...prevdata, data]);
    const tmp: Action[] = [];
    data.forEach((file: any) => {
      tmp.push({
        file_name: file.name,
        file_size: file.size,
        from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
        to: null,
        file_type: file.type,
        file,
        is_converted: false,
        is_converting: false,
        is_error: false,
      });
    });
    setActions(tmp);
    toast.success("File uploaded");
  };

  const handleSelectedChange = (event: any, action: Action) => {
    let value = event.target.value;
    if (extensions.audio.includes(value)) {
      setDefaultValues("audio");
    } else if (extensions.video.includes(value)) {
      setDefaultValues("video");
    }
    setSelected(value);
    updateAction(action.file_name, value);
  };
  const reset = () => {
    setIsDone(false);
    setActions([]);
    setFiles([]);
    setIsReady(false);
    setIsConverting(false);
  };
  const downloadAll = (): void => {
    for (let action of actions) {
      !action.is_error && download(action);
    }
  };
  const download = (action: Action) => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = action.url;
    a.download = action.output;

    document.body.appendChild(a);
    a.click();

    // Clean up after download
    URL.revokeObjectURL(action.url);
    document.body.removeChild(a);
  };
  const convert = async (): Promise<any> => {
    let tmp_actions = actions.map((elt) => ({
      ...elt,
      is_converting: true,
    }));
    setActions(tmp_actions);
    setIsConverting(true);
    for (let action of tmp_actions) {
      try {
        const { url, output } = await convertFile(ffmpegRef.current, action);
        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: true,
                is_converting: false,
                url,
                output,
              }
            : elt
        );
        setActions(tmp_actions);
        toast.success("Converted");
      } catch (err) {
        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: false,
                is_converting: false,
                is_error: true,
              }
            : elt
        );
        setActions(tmp_actions);
      }
    }
    setIsDone(true);
    setIsConverting(false);
  };
  const updateAction = (file_name: String, to: String) => {
    setActions(
      actions.map((action): Action => {
        if (action.file_name === file_name) {
          console.log("FOUND");
          return {
            ...action,
            to,
          };
        }

        return action;
      })
    );
  };
  const checkIsReady = (): void => {
    let tmp_is_ready = true;
    actions.forEach((action: Action) => {
      if (!action.to) tmp_is_ready = false;
    });
    console.log(actions);
    setIsReady(tmp_is_ready);
  };
  const deleteAction = (action: Action): void => {
    setActions(actions.filter((elt) => elt !== action));
    setFiles(files.filter((elt) => elt.name !== action.file_name));
  };
  useEffect(() => {
    if (!actions.length) {
      setIsDone(false);
      setFiles([]);
      setIsReady(false);
      setIsConverting(false);
    } else checkIsReady();
  }, [actions]);
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    const ffmpeg_response: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpeg_response;
    setIsLoaded(true);
  };

  if (actions.length) {
    return (
      <div className=" maincontainer">
        {actions.map((action: Action, i: any) => (
          <div className="afterdrop_container" key={i}>
            {!is_loaded && (
              <div className="afterdrop_container_loading">loading...</div>
            )}
            <div className="afterdrop_innercontainer">
              <div className="afterdrop_innercontainer_icon center-item">
                {fileToIcon(action.file_type)}
              </div>
              <div className="afterdrop_innercontainer_filename center-item">
                {compressFileName(action.file_name)}
              </div>
              <div className="afterdrop_innercontainer_filesize center-item">
                ({bytesToSize(action.file_size)})
              </div>
            </div>

            {action.is_error ? (
              <div className="converting converting_error">
                <span className="">Error Converting File</span>
                <BiError />
              </div>
            ) : action.is_converted ? (
              <div className="converting converting_done">
                <span>Done</span>
                <MdDone />
              </div>
            ) : action.is_converting ? (
              <div className="converting converting_ongoing">
                <span>Converting</span>
                <span>
                  <ImSpinner3 className="spinner" />
                </span>
              </div>
            ) : (
              <div className="convert_container">
                <span>Convert to</span>
                <select
                  value={selcted}
                  onChange={(event) => handleSelectedChange(event, action)}
                  className="convert_dropdown"
                >
                  {action.file_type.includes("image") && (
                    <>
                      {extensions.image.map((elt: any, i: any) => (
                        <option value={elt} className="mx-auto" key={i}>
                          {elt}
                        </option>
                      ))}
                    </>
                  )}
                  {action.file_type.includes("video") && (
                    <>
                      <optgroup label="video">
                        {extensions.video.map((elt: any, i: any) => (
                          <option value={elt} className="mx-auto" key={i}>
                            {elt}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="audio">
                        {extensions.audio.map((elt: any, i: any) => (
                          <option value={elt} className="mx-auto" key={i}>
                            {elt}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                  {action.file_type.includes("audio") && (
                    <>
                      {extensions.audio.map((elt: any, i: any) => (
                        <option value={elt} className="mx-auto" key={i}>
                          {elt}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            )}
            {action.is_converted ? (
              <button
                onClick={() => download(action)}
                className="download_single"
              >
                Download
              </button>
            ) : (
              <span onClick={() => deleteAction(action)}>
                <MdClose className="center-item cross_icon" />
              </span>
            )}
          </div>
        ))}
        <div className="download_option_container">
          {is_done ? (
            <div className="download_option_innercontainer">
              <button
                className="download_button download_button_after"
                onClick={downloadAll}
              >
                {actions.length > 1 ? "Download All" : "Download"}
                <HiOutlineDownload />
              </button>
              <button
                onClick={reset}
                className="download_button download_button_white"
              >
                Convert Another File(s)
              </button>
            </div>
          ) : (
            <button
              disabled={!is_ready || is_converting}
              className={
                !is_ready || is_converting
                  ? "download_button_disabled download_button"
                  : "download_button"
              }
              onClick={convert}
            >
              {is_converting ? (
                <span className="">
                  <ImSpinner3 className="spinner" />
                </span>
              ) : (
                <span>Convert Now</span>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <ReactDropzone
      onDrop={handleUpload}
      onDragEnter={handleHover}
      onDragLeave={handleExitHover}
      accept={accepted_files}
      onDropRejected={() => {
        handleExitHover();
        toast.error("Allowed files: Image, Audio & Video");
      }}
      onError={() => {
        toast.error("Allowed files: Image, Audio & Video");
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <div className="maincontainer">
          <div {...getRootProps()} className="dropcontainer">
            <input {...getInputProps()} />
            <div className="dropinnercontainer">
              {is_hover ? (
                <>
                  <div className="dropicon">
                    <IoCloudUploadSharp className="dropicon_icon" />
                  </div>
                  <h3 className="droptext">Yes, right there</h3>
                </>
              ) : (
                <>
                  <div className="dropicon">
                    <IoLogoDropbox className="dropicon_icon" />
                  </div>
                  <h3 className="droptext">Click, or drop your files here</h3>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </ReactDropzone>
  );
}
