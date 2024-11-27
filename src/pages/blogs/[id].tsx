import CustomDivider from "@/components/CustomDivider";
import Layout from "@/components/Layout";
import {Image, Button, Tooltip, Spacer, Input, Popover, PopoverContent, PopoverTrigger, Textarea} from "@nextui-org/react";
import { Vote } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ViewBlog(){
    const router = useRouter();
    const { id } = router.query;
    const UPVOTE_ICON = "/icons/upvote.svg";
    const DOWNVOTE_ICON = "/icons/downvote.svg";
    const UPVOTE_FILLED = "/icons/upvote-filled.svg";
    const DOWNVOTE_FILLED = "/icons/downvote-filled.svg";
    const [upvoteIcon, setUpvoteIcon] = useState(UPVOTE_ICON);
    const [downvoteIcon, setDownvoteIcon] = useState(DOWNVOTE_ICON);
    const [userVoteValue, setUserVoteValue] = useState(0);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [templates, setTemplates] = useState<string[]>([]);
    const [author, setAuthor] = useState('');
    const [authorId, setAuthorId] = useState();
    const [report, setReport] = useState('');
    const [reportError, setReportError] = useState('');
    const [touched, setTouched] = useState<{ report: boolean }>({ report: false });
    const [loggedIn, setLoggedIn] = useState(false);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [canEditBlog, setCanEditBlog] = useState(false);
    const [blogHidden, setBlogHidden] = useState(false);

    useEffect(() => {
        if (id) {
            fetchBlog();
        }
        if (localStorage.getItem('token')) {
            setLoggedIn(true);
        }
    }, [id, authorId]);
    
    useEffect(() => {
        checkExistingVote();
    }, [votes]);

    useEffect(() => {
        if (userVoteValue === 1) {
            setUpvoteIcon(UPVOTE_FILLED);
            setDownvoteIcon(DOWNVOTE_ICON);
        } else if (userVoteValue === -1) {
            setDownvoteIcon(DOWNVOTE_FILLED);
            setUpvoteIcon(UPVOTE_ICON);
        } else {
            setUpvoteIcon(UPVOTE_ICON);
            setDownvoteIcon(DOWNVOTE_ICON);
        }
    }, [userVoteValue]);

    async function reportBlog() {
        setTouched({report: true});
        if (!report) {
            toast.error("Please provide a reason for the report.");
            return;
        }
        try {
            const reportResponse = await fetch(`/api/blogs/${id}/report`,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    blogId: Number(id),
                    reason: report
                }),  
            });
            const data = await reportResponse.json();
            if(reportResponse.status === 403){
                toast.error(data.message);
            }
            else if(reportResponse.ok){
                toast.success(data.message);
                setTimeout(() => {
                    setReport('');
                    setReportError('');
                    setTouched({report: false});
                    setPopoverVisible(false);
                }, 750);
            }
        } catch (error) {
            toast.error('An error occurred, please try again.');
        }
    }

    const reportValid = useMemo(() => {
        if (report === "") {
            setReportError("Reason for report is required");
            return false;
        }
        setReportError("");
        return true;
    }, [report]);

    function checkExistingVote() {
        const userId = Number(localStorage.getItem('userId'));
        const existingVote = votes.find((vote) => vote.userId === userId);
    
        if (existingVote) {
            setUserVoteValue(existingVote.value);
            if (existingVote.value === 1) {
                setUpvoteIcon(UPVOTE_FILLED);
                setDownvoteIcon(DOWNVOTE_ICON);
            } else if (existingVote.value === -1) {
                setDownvoteIcon(DOWNVOTE_FILLED);
                setUpvoteIcon(UPVOTE_ICON);
            }
        } else {
            setUserVoteValue(0);
            setUpvoteIcon(UPVOTE_ICON);
            setDownvoteIcon(DOWNVOTE_ICON);
        }
    } 

    async function upvoteBlog() {
        try {
            if (userVoteValue === 1) {
                setUserVoteValue(0);
                await deleteVote();
                toast.info("Upvote removed.");
            } else {
                setUserVoteValue(1);
                await processVote(1);
                toast.success("Blog upvoted.");
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred while voting. Please try again.");
        }
    }

    async function downvoteBlog() {
        try {
            if (userVoteValue === -1) {
                setUserVoteValue(0);
                await deleteVote();
                toast.info("Downvote removed.");
            } else {
                setUserVoteValue(-1);
                await processVote(-1);
                toast.success("Blog downvoted.");
            }
        } catch (error) {
            toast.error("An error occurred while voting. Please try again.");
        }
    }

    async function processVote(voteValue: Number){
        await fetch(`/api/blogs/${id}/vote`,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                blogId: Number(id),
                voteValue
            }),  
        });
    }

    async function deleteVote() {
        await fetch(`/api/blogs/${id}/vote`,{
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
        });
    }

    async function fetchBlog() {
        try {
            const response = await fetch(`/api/blogs/${id}/view`, {
                method: "GET",
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.status === 404) {
                toast.error("Blog not found");
                setTimeout(() => {
                    router.back();
                }, 1000);
                return;
            }
            const data = await response.json();
            setTitle(data.title);
            setContent(data.content);
            const resTags = data.tags.map((tag: { name: any; }) => tag.name).join(", ");
            setTags(resTags);
            const resTemplates = data.codeTemplates.map((codeTemplate: { title: any; }) => codeTemplate.title).join(", ");
            setTemplates(resTemplates);
            const fname = data.user.firstName;
            const lname = data.user.lastName || "";
            setAuthor(fname + " " + lname);
            const ownerId = data.user.id;
            setAuthorId(ownerId);
            const blogVotes = data.Vote;
            setVotes(blogVotes);
            const hidden = data.isHidden;
            setBlogHidden(hidden);
            if (hidden && localStorage.getItem('userId') !== String(ownerId)) {
                router.back();
            }
            if(localStorage.getItem('userId') === String(ownerId) && !hidden){
                setCanEditBlog(true);
            } 
        } catch (error) {
            console.error("Failed to fetch blog:", error);
        }
    }

    return(
        <Layout>
            <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg mt-6 border-4 border-gray-300 dark:border-gray-600">

                {blogHidden && (
                    <div className="text-center text-2xl font-bold text-red-600 mb-6">
                        <h2>**Blog has been hidden by admins.**</h2>
                    </div>
                )}                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                    <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h1>
                    {canEditBlog && (
                        <Link href={`${router.asPath}/edit`} passHref>
                            <Button color="secondary" className="ml-0 sm:ml-auto">
                                Edit Blog
                            </Button>
                        </Link>
                    )}
                </div>

                <CustomDivider/>

                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                    <strong className="font-medium text-gray-800 dark:text-gray-100">Author:</strong> {author}
                </p>

                <div className="prose prose-lg text-gray-800 dark:prose-light dark:text-gray-200 mb-6">
                    <p>{content}</p>
                </div>

                <div className="mb-6">
                    <p className="text-xl font-semibold text-gray-800 dark:text-white">Tags:</p>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{tags}</p>
                </div>

                <div className="mb-6">
                    <p className="text-xl font-semibold text-gray-800 dark:text-white">Related Code Templates:</p>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{templates}</p>
                </div>

                <Spacer y={10}/>
                <CustomDivider/>
                <Spacer y={5}/>

                {loggedIn && (
                    <>
                        <div className="flex">
                            <Tooltip content="Upvote Blog" showArrow={true} delay={0} closeDelay={0} color="success" className="text-white rounded-md p-2 shadow-lg">
                                <Image
                                    width={40}
                                    src={upvoteIcon}
                                    className="opacity-100"
                                    alt="Upvote Icon"
                                    onClick={upvoteBlog}
                                />
                            </Tooltip>

                            <Tooltip content="Downvote Blog" showArrow={true} delay={0} closeDelay={0} color="danger" className="text-white rounded-md p-2 shadow-lg">
                                <Image
                                    width={40}
                                    src={downvoteIcon}
                                    className="opacity-100"
                                    alt="Downvote Icon"
                                    onClick={downvoteBlog}
                                />
                            </Tooltip>
                            <Spacer x={8} />
                            <Tooltip content="Comment" showArrow={true} delay={0} closeDelay={0} color="primary" className="text-white rounded-md p-2 shadow-lg">
                                <Image
                                    width={40}
                                    src="/icons/comment.svg"
                                    className="opacity-100 border-3 border-black"
                                    alt="Comment Icon"
                                />
                            </Tooltip>
                        </div>

                        <Popover 
                            placement="top"
                            isOpen={popoverVisible}     
                            onClose={() => {
                                setTouched((prev) => ({ ...prev, report: false }));
                                setPopoverVisible(false);
                            }}
                        >
                            <PopoverTrigger>
                                <Button className="mt-4" color="warning" onClick={() => setPopoverVisible(true)}> Report Blog </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] bg-white dark:bg-gray-800 shadow-md rounded-lg mt-6 border-2 border-gray-300 dark:border-gray-600">
                            {(titleProps) => (
                                    <div className="px-2 py-3 w-full">
                                        <p className="text-small font-bold text-gray-900 dark:text-gray-100" {...titleProps}>
                                            Reason for report <span className="text-red-500">*</span>
                                        </p>
                                        <Textarea 
                                            required
                                            size="sm" 
                                            placeholder="Reason for reporting this blog"
                                            variant="bordered" 
                                            className="text-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600" 
                                            value={report}
                                            isInvalid={touched.report && !reportValid}
                                            color={touched.report && !reportValid ? 'danger' : 'default'}
                                            errorMessage={touched.report ? reportError : ''}
                                            onChange={(e) => {
                                                setReport(e.target.value);
                                                if (!touched.report) setTouched((prev) => ({ ...prev, report: true }));
                                            }}                                        />
                                        <div className="flex justify-center w-full mt-2">
                                            <Button size="sm" className="w-32" color="danger" onClick={reportBlog}>Submit Report</Button>
                                        </div>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
    
                        <Spacer y={5} />
                        <CustomDivider />
                        <Spacer y={10} />
                    </>
                )}

                <div>
                    <p className="text-xl font-semibold text-gray-800 dark:text-white">Comments</p>
                </div>

            </div>
        </Layout>
    );
}