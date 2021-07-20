import { AfterViewInit, Component, HostListener, Inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { open, close } from 'src/app/core/store/flag/flag.actions';
import { setValue } from 'src/app/core/store/setValue/set-value.actions';
import Player from '@vimeo/player';
import { isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { NewArticle } from 'src/app/common-tool/new-article/new-article.modal';
import { LearnWillingness } from 'src/app/common-tool/learn-willingness/learn-willingness.modal';
import { NewActiveItemInfo } from 'src/app/common-tool/new-active/new-active.model';
import { HotSubjectItemInfo } from 'src/app/common-tool/hot-subject/hot-subject.model';
import { NewVideoItemInfo } from 'src/app/common-tool/new-video/new-video.model';
// import Swiper core and required modules
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper/core';
import { ResizeEvent, ResizeService } from 'src/app/services/resize.service';

// install Swiper modules
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  @HostListener('window:resize', ['$event'])
  onResize(event: ResizeEvent): void {
    const size = this.resizeService.detectSize(event.target.innerWidth);
    this.showNewVideoIndex = this.detectNewVideoIndex(size);
  }
  flag$: Observable<boolean>;
  getdata: Record<string, unknown> | undefined;
  showNewVideoIndex: number | undefined;

  newArticle: NewArticle = {
    articleImg:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHCBISEhgSERERERISEhIRERESEREREg8RGBgZGRgUGBgcIS4lHB4rHxgYJjgmKy8xNTU1GiQ7QDszPy80NTEBDAwMEA8QHhISHjQlISE0NDQ0NDQ0NzQxNDQxMTE0NDE0NDQ0MTQ0MTQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQxNP/AABEIALcBEwMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAAAQIDBAUGB//EAD8QAAIBAgMFBgQDBgQHAQAAAAECAAMRBBIhBTFBUWEGEyJxgZEyUqGxB0JiFCMzgpLBJKLh8ENTdIOywtEV/8QAGQEBAQEBAQEAAAAAAAAAAAAAAAECAwQF/8QAIBEBAQACAgMBAAMAAAAAAAAAAAECESExAxJBURNhcf/aAAwDAQACEQMRAD8A6kCOAjgIWmmAI6JHQCI40joMNIDW3ReUOEOAgqYRbxl5LSou5sqk9eEJpGTEAJNgCTyE1aGyPnb0E0qWFRBZVAk2sxrHw+xy2rtYchvmH24drUdl4TwVMaxFRl308Kv8RieZ3epnX43G0cPTNSs6UkG9nIUeXUzzrY/aHDPtevisQ5RXSnh8I7owQUxvJJHhuxJ15zWMt5/Fupw7ahgqeGSnh6ShVp0xlUC2g0vGY7CJWptTdQysLEf3HWaOJpBirixsLE81P+tpTxmJp0UapUYIiAsxPAROTp5LtHA1tlViRmfDObqwHweduM0qnaRKiizqfMj7esw+2fafEYqpkQ91hxZqagAtVI4uT/4j6zg8RWqFyb5STuVQo9hO18GVxmWlw82rZHrFbb1OmllsajaAKLsT0A1Jlns32ed6n7Xi18e+jSbXux8x/VMj8L8VSqhqT00FemAQ9heqnn8w4+YnpRGll3nQDmZj19ePplncuy4JL1D+lLn10H2M5Ogq7M2zkTw4XaQIZfypiRcgjo2o9Z3mBwYpqeLNq55mcv8AiVsw1MGa1MfvsK6YimbXIKG9pje7pNai7jOzNF2LKGS+uh0B8pzO09lGg1m8Sn4XG49DyM7vZmOXE4anXX4atNHH8wvaD4VKilXUMpO4i8uOVnbOXjl6eaNTEiekJ2W0uy6kE0Tlb5Dqp9eE5LaWCrU9HpsmoFyNPcTrMpenC4XHt2WyKeWko6TRIlPZq2poP0iXX3Hynmvb1TpgYk3c+ciIkj6k+ZiETQiIjGEmIjCJRAwjbSVhGEQmjIRYQjdtC0dC0jRLRbRbQtDJIGLAwEG6IN0Fi0kzEKPzMB7mFrW2fs0OodzodQvPzmwlMKLAADpFRQoCjcAAPKPmdtSaMIkeIxCU0Z3IVEUu7HcFAuTJpyv4gF2w9PDoG/xWKo0Hy7xSLZn/AMqkessm7oyuorbGw37e4x+IXMtz+x0WF1pU/wDmZeLnnN/FbJoVkenUpq+dSGzKLm43gyxhMNkUBTkUAKFAFlUDQD0kmJ/do7qCzKjMANWNhewlt54Zk45c7+HmId8EKdQlnw9SrhSTqSKblVv6Wmd2o2NicbXFLP3OGpjOSNTVq8Lj5QPvNDsDhqiUqz1EZGq4qrVyMCCM1j97zosStmBsNfuJr29crok3Jt5X2p7Ling2qEeOiVfNbRhcKwv5GcRs7Yhxdfu6YJUeKoyi+VOnWeo/iXjQuHSjfxVHD2v+RNST0uVnl+xNsvg8Yla5KE5Kyj81MkXPmN8+h4rlfFb9+PNlJ76dpiNgPh8lTBoadSnbKHFlPO5434z0HYCPUppWq0+7dl/hkhsvMg9ftLOGppUAsQyEBr7wVO73mqFA0Gk8Gee+Hoxx0hIlXH0A9NkIuGUgiX3QEWlbu3XiHHC+hHrxnKNuM/DioUo18E/xYLEuig7+5c50PlqR6TsQlhOPUfsu2w9stPH4cow0t31LxKf6SZ2RBbdumsu9/qQ0C8jq4dWFmAI6yyEtFyzO1ZL4XJ8O4cOUgxBsh8puFBMnbKBaZI4b47HORCIoizSGERpEeY0wqIiRsJMwkbCVEMI60IZb0BCEjQhFhASBixIZNEv7DoZqhY7k19TulCb2wKVqZb52J9BpIs7ahixDFEy2JTxzL4FK5i1RQD8vM+33lyQ4ikGyk/ldSPe0sSpctou/fCIfsDII8PbLcC1ySB0vExSXQ8xqJMo0tHSjwztnjTWxlW5utLLRp8rAXY/1E+05IYcs6qqlmdgiqN7MxsFHUm06vtbs04bGVkN8rua1Mnij+L6NmHpNr8Mez4q1zjai+CgSlEHc1YjVv5QbebdJ9f8Akxw8Uy+aeL1uWenovZrZrYbC06LtmdEUO36rbh0G70mrEZgN8iLFug+pnyLbbuvbJqaFWrbRdT9BGKW46mPVI+0K5DtxRyDD4nS9HE02Y8kPxD2E61ZgduaQfAVQfyhX/pYH7TU2RiO8w9J/npU29SomrzjKxO6tmJCKZhshmdj6eamw5qZeqnS0grL4SOksHGiLFZbEjkSITSGmMMeYwwGmRtJDI2lRHCEIG7FixJkAixIsoQxDFMQwGgXNhvOg8512GpBECD8oAnN7LpZ6y8l8R9P9bTqRM0hILuiNprBZGjo193qv3jrxH3eq/eA6Mbd6iPjSbm3LUwHCAMIQOI/EbYT4lKVSiuaorrRI5pUYAE9A1vQmdRsjZ6YTDpQT4aaBb8WO9mPUkk+sv3ke/wDtN5eTK4zH5GJjJbf03KSbn06SS0UCBmGyExLRQsWBm7dwve4apT+am4/ymZ3Yav3mz6DckKf0sR/ab9QXBHMETkPw3rgYR6ZP8HF4il6B7j7zc5xv+sXt2EQnWIX00jU5zDZjamNcaSTLEfdKOOxKWqMP1GRy5tNLVW62MqGVDDGGSGMMoYZGwkpjGlRDCTrSuISbNNiJCEikMIsQwgiEwMQmUa/Z+nq7+Sj7n+02zKOx6eWkvNrsfXd9JeMzVgJjFFo8xnGFKYyoTY9Bf1GseZXrLUJ8GW1uMCcvYXO7fEog2ud5Nz05CUDRraZtVUg2Rhw3bxL1N24gjzjSJ4hEQGIz8pFIx4e8cI3LHgQEMWI0dASBhEMBDOJ7B2WvtGlYeDHM4HR0BnaMZwXZGqBtfaNP5+4qj0UqT9pvHqs3uOycZW00B4SZDaV6tUAjjcyZpGkshqON0kQyKqkgwttp4lbmLe0y5ubYS9MH5WH1mLKGGMMkMYZYhhEYwkhiKtyBzMDQoUvCPKEu06eg8oTKq8SLGysiBhEhQYgW5AHEge8UyxsynnqqORzH0lTTpkAVQOQAkgN4wpGhSJlpJujG3iOMjckW5XgSRbxlSoqgszBVUXZmIVVHMk7o0OCAQQQRcEG4IO4g8RAkDCOvIVW8cYAxvHBYiiOEBbRYRJAxo+8YYpMBYjNGnSBgQ16qgasFvcC5tc8hMfB4NUr1Kwo5XdFRqgQBnUcCeNpax4vUXcCqkqSL2bmOspYak1ZMzMpcuwqZrZ7DQqt9Bytym5xAj12NQKwynNa3TgZs8JylLFZ8SlMm7Je+ubwBmya8fDbWdSGlynSRIhj3W4kKNaWAOszVZG1B+7b0+8wJ0m1kvTa3K/tObgIY0xYhiBhkmEW9QSMyxs5buTylo1LQhCYVWjYpiTbAiGLEMKQzS2AR3hvvyG3uLzNMvbFRjVzAeEAhjwF90iOlJgDeNCc4+ZU0yOudJKYw+XnLFZ23dlrjMM9Au9PvMhV0tdGVgymx0IuBcHeLieUVX2jsSpkzKlIs2W5JwGK3my5j/h6h3lSQp1ylRv8AYalTIgHG+UXmfiKa1EZKgWojfEjgMrdCp0j21w1j47lNoezXaRMYoBR6FfIHahUFiyaeNDuZbkA8VJAIFxfdtOeo7OppVFZVsVN8umQNYrnUflaxIuODHTWbAxy8QfQXEXKfF/jyn9rdoolVcYp4EDnpJVrr8y67tbSbjNxyncTRDFiNCGwhASqDGGOaIYRWxWFD2PESt/8An02OZ1DHmQLnzmiJWx1UU6b1GNgilpYjjMCAdo1HHwpmUfQf2M6lak4/YqOc1S1y7Ek9bzp8NhKm9nC/Wdcozj0t7+csYfTnG00Xi4J9pKuXdcGc62iqOGuOB0nK10ysV5EidQ+GUnQuD03TG2zg2Q95e6tYdQYGYY0xSY0mA0zR2YnhJ5mZrTZwiWQSUiWEISKqxIsSaZJAwgYQ0zW2BWsWTnZh9jMkx+Grd24bkdfKB1+aOJkCVAQCONpLMtHgxpbjuHOKJS2nUAQi/ibwqObEaD2BPpISbukdeoKh6Dd16zMx1SrS8S0zWTiEy516hSdR5axKWJZR4/DbffdLCYkNuIM59vbMLjxOmXT7Q0WIRi1Nz/w6qPSc9cjgH6TSoYlW3MptyI3x+I7t1yOiup3qyhgR1B0mW+waJN6LPhzpY0nIQdMjXT2EabmrOZpssAdxtIqoYix1EzUw+JpXzuKqj4SqEN1zC/2BvyEdg9rUncpm8aizU2zK6dWQ2IHW0qa/OXSYJ7oLkEgAHW+snMoYBRmLLoMtjY3BN/8AfvL7GbnLw5zWRkA0SEqAmIXhe0UsALmwHOFM7y28WnO9taj9yirfIz+MjpuB9Zu1cQhFgQZVSkK6lXW9O9iD+a01P1MpenL9m9l1n8eq0r3AJtnPTpO0oYYqN/oJMihRYAADQADQCPvGWVrOM0jNBeIHtBaQG4D2kl4hEztswnhxmJ2iqHIq7vEb+YE0ce5UKymxBtMbbWLR0Cg3fNc9BaWQY0IRpM0DiB1E3KXwjymPhlzOBNkaTNIWELwgVIkISsgxIphAaY0x5jTCNjYmIvdWPwC6+R0ms9UAXuJydGpkYH36iaXeXGhuIajcFQBMx3BSx8hrOU21tH/G4akdxoYnED9VUd2oHor1PebO1MR3eFv82VPRjr9Lzldp4bv2oVVYLVwr5kci4am4y1KZ803ciFiY7xtXDKTKWuhWpfeAQd4NpB+wUL3RTRY8aZyC545fhPnaUAyVPCWdDwZGAI97j6SVcO6fDiA4HCotif5kIA/pnF9C4rNTD1R8Lo4HzDK1uXEE+0aldl+OnUB6KWH+W8jFeoDdk6eBg4PvYyUYpwpbuyALasyIvuTYepjW1u8ZykG1EOmcX+UnKw9DrCrQp1rK6K28hmAzL1U7wfKV8XTZvjp0lHOpVpAfUzIfH4amcpx+DTjkWsazD+VQZqYZVyvl8cnFbOF2dVp1GfDsuc2ZwzMqVlGgz77PbQMPUGdDSxAYWIysACyH8pPDr/vmJxI7U0FBCYmu4AGbusDUAIHN6lh9bRidqqR+FcaxsRldUYt1AVyqjdOnrdcvJlZlluO5eqF+IgDmSBKeJ2tSVTaqhbgAwY79d0872j2vRCBTwil2IAapTaqbsbAFVZB9TLAx+NZQ/eUsNcX/AHOGohgOodGI/qjU+0mOW+I7Btr5j4O8e/BKbE/aIcUwUvVDUkUXL1zTpqo5ksdJwletinNmxFeqf+prU0I5FFOUzFTZ2N7/ADqyLTZwWpCwLoDcIzgZm9ZNY/rtjj5JepHo7doMGqllxVCp1pu1YA/9sNLFLtnhm8NKliaxtupYd/8A2y6TO2dTpMQ5od26jccrLfmCJcxmM7q1RT8N7jmvETMuMutVryeHKzdsa1PatRhdcFideB7tGHmHZfoTLmFqu4vUpmkb6KXVjbTUldBx0ud0dhawcegI6g7pITNX/HlAMHNhIq9XKL8eEp4vaSU0NzdyPCvGNKo7cxWgQHxXubcBMEx9SoWYsxuSbmMM0CNMUmNJhFzZq3YnlNImUtmL4b85bJmasOzRIzNCXRtDeF4l4l5WSwiXheAsaYsQyIaYhcrqCRFMY+6Bq7bBrYSnkP50z233Ctp7zAw2Fq3sLsOQBLG3IcTLlPaZojKUFRGYNYsVysARfT/ekfiNtBgy06IQupXPnJyg6EgW32m8bZNJdOarUcW9XvMHTemqkq/fCmyubW+HMNfL6y8uE2m++tRp9cq3+imdHhKISmgG4i9+d5I4tFs/I6TLLXdYA7P41v4m1sQgP5aKrTA8mUK31j07IUtTVxWNr5lKt3uJd1KneLMWm0a0Y9Uxtm/2oUey+z6ZDCgGcCwdnctblcHdL9PD4an/AA8PRXqKaX97SB3Mch8MW39JIlxOILqUsMpFithYjlaYmI2eVBNIquberKGv5HhNNopS4mbJWsbcenBY8lHtWpE3/Oh1twIXcR5SZD3iZqeIZgNNbPlPIqwuD5zr8TgEqKVcX5Hip5icZjtjNhqtw7KxByMp0dfLcfKZuOnq8fk9uPqTD1MWjXK0sQml8g7uoB75T7CXsPtWlnC1GajUO5KqFLk8FY6N6EyhRx9Sn/EQlR+emCf6l/8AntNqhi6dRArZKiH5gCCOWsxY9EaWGrj0O633mH272stDDm5Gdwyot9WYiw0Hn9JrDZ9MJempUb1VTp6cpx2zezlfFY79qxxJp0nzLTsQCVN1Rf0jeTxmsMLlzPjl5/LMZr7Xq+w3KolNvi7hM3moUH7zSdzMPY1UtiCT8jADkLiaG08VkUhfi+01lOXhjL2rtBi5RDouhPMzJZidSbnmYl4SqQmIYExpMIDGkwJgupA6wNfBrZBJiYxBYDyiyBIQhAgvEvEvCVC3heJC8B14kSEIDGPujryKu1lMCljRmUQprEpC++TKJU06bZpzUV6C3tFrUb8x5RmxDelbkxluoJG50ynwrDcwPmJGRNJl5SpUp6mXYpVJPhxdfeMqLaXMCl6fvFIq5dZMU0kndW1j1XSFQokMZs6nXpmm4uDuPFG4MJaRJMqyVZw83xGCxODqZHBemblXGtxzHPyMu4XZnfAMqOjb8wRsjetrT0DuVO8X6HUSTuwRa2nKSx2nnsnTC2ZgRSAuxY8bnwg9BLlbAK2q6S4cOoOgtAiWcdOOWVyu8mdgqPdMzneBlXqTINo1DkJO8x1NySbkmzNa/nK+028IElu6jNvAmJeITKhTGEwJjSZQEyXCrdx0lcmXNmjUmSjThG3iXgPhG3hArXheEIZEIQgEIQgITKFRi7W4CEIiVIEtC0ISq39gN+7Yfqmi4hCRqGFJWrrb2hCIqjUF5ewa2p284QmqiZEju7tEhMqeFkiLrCEKeFjxCEiAyvU0v5GEJSsXDn+8q7UbcIQknaKF4hMITQaTGkwhCEJmjs4eG/OJCKLhMaTCEikvCEIH/9k=',
    articleTitle: '加護病房靜脈同時給予多種藥品之型態與風險',
    articleSubtitle: '對某醫學中心11個加護病房的護理師問券調查，以了解同時竟賣給多種藥的型態與風險。',
    author: '黃郁方',
    authorImg:
      'data:image/jpeg;base64,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',
    viewer: '2021/05/11．1,567',
  };

  learnWillingness: LearnWillingness = {
    learnTitle: '全人健康',
    learnSubTitle: '除了沒有患病之外，生理、心理和社交方面也需處於安舒的狀況。',
    lookMoreUrl: '/pages/home/1',
    learnImg: '../../../assets/img/pill.svg',
    learnBackgroundColor: '#3B5A90',
  };

  newVideoItem: NewVideoItemInfo = {
    time: '32:24',
    headUrl: '../../../assets/img/fakeImge/new_video_fake_img.png',
    headShotUrl: '../../../assets/img/fakeImge/new_video_fake_headshot.png',
    title: '從小實施衛教的重要性',
    text: '歐朔銘 醫師•4,567 已觀看',
  };

  hotSubjectItemInfo: HotSubjectItemInfo = {
    title: '眼科',
    subTitle: '121相關課程',
    svgClass: 'eyeIcon',
  };

  newActiveItemInfo: NewActiveItemInfo = {
    img: '../../../assets/img/fakeImge/new_active_fake_img.png',
    tag: ['線上研討會', '系列講座'],
    title: '110年安泰醫療社團法人安泰醫院辦理醫護人員教育訓練計畫',
    subTitle: '地點：安泰醫院',
    headShot: '../../../assets/img/fakeImge/new_active_fake_headshot.png',
    name: '黃織芬 教授',
    time: '2021/05/11 19:00-2021/05/13 17:00',
  };

  resizeObservable$: Observable<Event> | undefined;
  resizeSubscription$: Subscription | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Record<string, unknown>>,
    private store: Store<{ flag: boolean }>,
    private storeValue: Store<{ setValue: { value: string } }>,
    private metaTagService: Meta,
    private resizeService: ResizeService,
  ) {
    const size = this.resizeService.default();
    this.showNewVideoIndex = this.detectNewVideoIndex(size);

    this.flag$ = store.select('flag');
    storeValue.select('setValue').subscribe((resp) => {
      console.log(resp);
      this.getdata = resp;
    });

    this.metaTagService.addTags([
      {
        name: 'keywords test',
        content: 'Angular SEO Integration, Music CRUD, Angular Universal',
      },
    ]);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // const player = new Player('handstick', {
      //   width: 640,
      // });
      // const onPlay = (data: unknown) => {
      //   console.log(data);
      //   console.log('pause the video!');
      // };
      // player.on('pause', onPlay);
      // this.setVideoTime(player);
      // this.getVideoDuration(player);
      // this.getVideoTime(player);
    }
  }

  private getVideoTime(player: Player) {
    player
      .getCurrentTime()
      .then(function (seconds) {
        // seconds = the current playback position
        console.log(seconds);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  private getVideoDuration(player: Player) {
    player
      .getDuration()
      .then(function (duration) {
        console.log(duration);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  private setVideoTime(player: Player) {
    player
      .setCurrentTime(30.456)
      .then(function (seconds) {
        console.log(seconds);
      })
      .catch(function (error) {
        switch (error.name) {
          case 'RangeError':
            // the time was less than 0 or greater than the video’s duration
            break;
          default:
            // some other error occurred
            break;
        }
      });
  }

  private detectNewVideoIndex(size: string): number {
    switch (!!size) {
      case size === 'xs':
        return 1;
      case size === 'md':
      case size === 'sm':
        return 2;
      case size === 'lg':
        return 3;
      case size === 'xl':
      case size === 'xxl':
        return 4;
      default:
        return 4;
    }
  }
  // xs:0 | sm:576px | md:768px | lg:992px | xl:1200px | xxl:1400px

  open(): void {
    this.store.dispatch(open());
  }

  close(): void {
    this.store.dispatch(close());
  }

  set(): void {
    const radom = Math.random().toString();
    this.storeValue.dispatch(setValue({ value: radom }));
  }
}
