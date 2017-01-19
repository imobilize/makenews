import {
    paginatedFeeds,
    clearFeeds,
    displayFeedsByPage,
    newsBoardTabSwitch,
    displayArticle,
    CLEAR_NEWS_BOARD_FEEDS,
    PAGINATED_FETCHED_FEEDS,
    NEWS_BOARD_CURRENT_TAB,
    DISPLAY_ARTICLE
} from "../../../src/js/newsboard/actions/DisplayFeedActions";
import AjaxClient from "../../../src/js/utils/AjaxClient";
import mockStore from "../../helper/ActionHelper";
import { assert } from "chai";
import sinon from "sinon";

describe("DisplayFeedActions", () => {
    describe("paginatedFeeds", () => {
        it("should return type DISPLAY_FETCHED_FEEDS action ", () => {
            let feeds = [
                { "_id": 1234, "sourceUrl": "http://www.test.com", "docType": "feed" },
                { "_id": 12345, "sourceUrl": "http://www.test2.com", "docType": "feed" }
            ];
            let paginatedFeedsAction = { "type": PAGINATED_FETCHED_FEEDS, "feeds": feeds };
            assert.deepEqual(paginatedFeeds(feeds), paginatedFeedsAction);
        });
    });

    describe("newsBoardTabSwitch", () => {
        it("should return type NEWSBOARD_CURRENT_TAB action ", () => {
            let newsBoardTabSwitchAction = { "type": NEWS_BOARD_CURRENT_TAB, "currentTab": "web" };
            assert.deepEqual(newsBoardTabSwitch("web"), newsBoardTabSwitchAction);
        });
    });

    describe("clearFeeds", () => {
        it("should return type CLEAR_NEWS_BOARD_FEEDS action ", () => {
            let clearFeedsAction = { "type": CLEAR_NEWS_BOARD_FEEDS };
            assert.deepEqual(clearFeeds(), clearFeedsAction);
        });
    });

    describe("displayFeedsByPage", () => {
        let sandbox = null, offset = 0;
        beforeEach("displayFeedsByPage", () => {
            sandbox = sinon.sandbox.create();
        });

        afterEach("displayFeedsByPage", () => {
            sandbox.restore();
        });

        it("dispatch displayFetchedFeedAction action with feeds on successful fetch", (done) => {
            let sourceType = "twitter";
            let feeds = { "docs": [
                { "_id": 1234, "sourceUrl": "http://www.test.com", "docType": "feed", "sourceType": "twitter" },
                { "_id": 12345, "sourceUrl": "http://www.test2.com", "docType": "feed", "sourceType": "twitter" }
            ] };
            let ajaxClientInstance = AjaxClient.instance("/get-feeds", true);
            let ajaxClientMock = sandbox.mock(AjaxClient).expects("instance")
                .returns(ajaxClientInstance);
            let postMock = sandbox.mock(ajaxClientInstance).expects("get")
                .withArgs({ offset, "sourceType": sourceType }).returns(Promise.resolve(feeds));
            let store = mockStore({}, [{ "type": PAGINATED_FETCHED_FEEDS, "feeds": feeds.docs }], done);
            store.dispatch(displayFeedsByPage(offset, sourceType, (result) => {
                try {
                    assert.strictEqual(result.docsLength, 2); //eslint-disable-line no-magic-numbers
                    assert.isFalse(result.hasMoreFeeds);
                    ajaxClientMock.verify();
                    postMock.verify();
                } catch(err) {
                    done(err);
                }
            }));
        });

        it("dispatch displayFetchedFeedAction action with no feeds on successful fetch", (done) => {
            let ajaxClientInstance = AjaxClient.instance("/get-feeds", true);
            let ajaxClientMock = sinon.mock(AjaxClient);
            ajaxClientMock.expects("instance").returns(ajaxClientInstance);
            let postMock = sandbox.mock(ajaxClientInstance);
            postMock.expects("get").returns(Promise.reject("error"));

            let store = mockStore([], [{ "type": PAGINATED_FETCHED_FEEDS, "feeds": [] }], done);
            store.dispatch(displayFeedsByPage(offset, "twitter"));

            ajaxClientMock.verify();
            postMock.verify();
        });
    });

    describe("displayArticle", () => {
        it("should dispatch the current selected article", () => {
            let displayArticleAction = { "type": DISPLAY_ARTICLE, "article": { "_id": "id", "title": "title" } };
            assert.deepEqual(displayArticle({ "_id": "id", "title": "title" }), displayArticleAction);
        });
    });
});
