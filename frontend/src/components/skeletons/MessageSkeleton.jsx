const MessageSkeleton = () => {
	return (
		<>
      <div className="message-skeleton-container">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-text-container">
          <div className="skeleton-line skeleton-line-short"></div>
          <div className="skeleton-line skeleton-line-short"></div>
        </div>
      </div>
      <div className="message-skeleton-container reverse">
        <div className="skeleton-text-container">
          <div className="skeleton-line skeleton-line-short"></div>
        </div>
        <div className="skeleton-avatar"></div>
      </div>
    </>
	);
};
export default MessageSkeleton;
