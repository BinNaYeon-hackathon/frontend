import InstagramPost from "./InstagramPost";
import LinkedInPost from "./LinkedInPost";
import XPost from "./XPost";

export default function PostRecordRender({ tab, post, onChange }) {
  const components = {
    instagram: InstagramPost,
    x: XPost,
    linkedin: LinkedInPost,
  };

  const Component = components[tab] || InstagramPost;

  return (
    <Component
      brandName={post.brand_name}
      createdAt={post.post_date}
      content={post.body}
      setContent={onChange}
      hashtags={post.hashtags}
      images={[post.image_url]}
    />
  );
}
