app.controller('mainCtrl', function ($scope, $location, $http, $rootScope, $interval) {
    var stop;

    $scope.timeToEnd = 60000;

    $.ajax({
        headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
        url: 'http://api.football-data.org/v1/fixtures', dataType: 'json', type: 'GET',
    }).done(function (data) {
        $scope.games = [];

console.log(data);

        var i = 0;


        $scope.getGames = function () {
            var lastGame = i + 5;
            if (i < data.fixtures.length) {
                for (var b = i; b < data.fixtures.length && b < lastGame; b++) {

                    if (i < data.fixtures.length) {
                        $scope.games[i] = data.fixtures[i];
                        console.log($scope.games[i].result);
                        if ($scope.games[i].result.goalsHomeTeam && $scope.games[i].result.goalsAwayTeam) {
                            $scope.games[i].realScore1 = $scope.games[i].result.goalsHomeTeam;
                            $scope.games[i].realScore2 = $scope.games[i].result.goalsAwayTeam;
                        }
                        $scope.$applyAsync();
                        i++;
                    }
                }

                var seconds_left = 60;


                var interval = setInterval(function () {
                    if (stop != undefined) {
                        document.getElementById('timer_span').innerHTML = 'More results in ' + --seconds_left + ' Seconds';
                        if (seconds_left <= 0) {
                            seconds_left = 60;
                        }
                    } else {
                        document.getElementById('timer_span').innerHTML = "";
                    }
                }, 1000);


            } else {
                $scope.stopGames();
            }
        }

        $scope.getGames();

        stop = $interval(function () {
            $scope.getGames();
        }, $scope.timeToEnd);

    }).error(function (data, status) {
        console.log(data, status);
    });

    $scope.stopGames = function () {
        document.getElementById('timer_span').innerHTML = "";
        $interval.cancel(stop);
        stop = undefined;

    }

    $scope.calculateScore = function (competition, homeTeam, awayTeam, match, homeTeamLink, awayTeamLink, index) {

        console.log(competition, homeTeam, awayTeam, match, homeTeamLink, awayTeamLink, index);

        // Soccer season
        $.ajax({
            headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
            url: competition, dataType: 'json', type: 'GET',
        }).done(function (data) {
            $scope.games[index].league = data.league;

            // League table
            if (competition != 'http://api.football-data.org/v1/competition/405') {
                $.ajax({
                    headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                    url: competition + '/leagueTable', dataType: 'json', type: 'GET',
                }).done(function (data) {
                    for (var i = 0; i < data.standing.length; i++) {
                        if (data.standing[i].teamName == homeTeam) $scope.games[index].homeTeamPosition = data.standing[i].position;
                        if (data.standing[i].teamName == awayTeam) $scope.games[index].awayTeamPosition = data.standing[i].position;
                    }
                    if ($scope.games[index].homeTeamPosition < $scope.games[index].awayTeamPosition) {
                        $scope.games[index].homeTeamPositionNormalized = 1;
                        $scope.games[index].awayTeamPositionNormalized = $scope.games[index].homeTeamPosition / $scope.games[index].awayTeamPosition;
                    } else {
                        $scope.games[index].awayTeamPositionNormalized = 1;
                        $scope.games[index].homeTeamPositionNormalized = $scope.games[index].awayTeamPosition / $scope.games[index].homeTeamPosition;
                    }

                    if ($scope.games[index].homeTeamPositionNormalized > $scope.games[index].awayTeamPositionNormalized) {
                        $scope.games[index].homeTeamPositionMultiplyer = ($scope.games[index].homeTeamPositionNormalized + ($scope.games[index].homeTeamPositionNormalized - $scope.games[index].awayTeamPositionNormalized));
                        $scope.games[index].awayTeamPositionMultiplyer = $scope.games[index].awayTeamPositionNormalized;
                    } else {
                        $scope.games[index].awayTeamPositionMultiplyer = ($scope.games[index].awayTeamPositionNormalized + ($scope.games[index].awayTeamPositionNormalized - $scope.games[index].homeTeamPositionNormalized));
                        $scope.games[index].homeTeamPositionMultiplyer = $scope.games[index].homeTeamPositionNormalized;
                    }

                    // Home team
                    $.ajax({
                        headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                        url: homeTeamLink, dataType: 'json', type: 'GET',
                    }).done(function (data) {
                        $scope.games[index].logo1 = data.crestUrl;

                        // Away team
                        $.ajax({
                            headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                            url: awayTeamLink, dataType: 'json', type: 'GET',
                        }).done(function (data) {
                            $scope.games[index].logo2 = data.crestUrl;

                            // Home team players
                            $.ajax({
                                headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                                url: homeTeamLink + '/players', dataType: 'json', type: 'GET',
                            }).done(function (data) {
                                var playersValue = 0;
                                for (var i = 0; i < data.players.length; i++) {
                                    playersValue += parseInt(data.players[i].marketValue);
                                }
                                $scope.averagePlayerValueHome = Math.round(playersValue / data.count);

                                // Away team players
                                $.ajax({
                                    headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                                    url: awayTeamLink + '/players', dataType: 'json', type: 'GET',
                                }).done(function (data) {

                                    // Home team fixtures
                                    $.ajax({
                                        headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                                        url: homeTeamLink + '/fixtures', dataType: 'json', type: 'GET',
                                    }).done(function (data) {
                                        var homeGames = 0;
                                        var countGoalsHome = 0;
                                        var countGoalsHomeInHome = 0;
                                        for (var i = 0; i < data.fixtures.length; i++) {
                                            if (homeTeam == data.fixtures[i].homeTeamName) {
                                                countGoalsHome += data.fixtures[i].result.goalsHomeTeam;
                                                countGoalsHomeInHome += data.fixtures[i].result.goalsHomeTeam;
                                                homeGames += 1;
                                            }
                                            if (homeTeam == data.fixtures[i].awayTeamName) {
                                                countGoalsHome += data.fixtures[i].result.goalsAwayTeam;
                                            }
                                        }
                                        $scope.averageGoalsHome = countGoalsHome / data.count;
                                        $scope.averageGoalsHomeInHome = countGoalsHomeInHome / homeGames;

                                        // Away team fixtures
                                        $.ajax({
                                            headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                                            url: awayTeamLink + '/fixtures', dataType: 'json', type: 'GET',
                                        }).done(function (data) {
                                            var awayGames = 0;
                                            var countGoalsAway = 0;
                                            var countGoalsAwayInAway = 0;
                                            for (var i = 0; i < data.fixtures.length; i++) {
                                                if (awayTeam == data.fixtures[i].homeTeamName) {
                                                    countGoalsAway += data.fixtures[i].result.goalsHomeTeam;
                                                }
                                                if (awayTeam == data.fixtures[i].awayTeamName) {
                                                    countGoalsAway += data.fixtures[i].result.goalsAwayTeam;
                                                    countGoalsAwayInAway += data.fixtures[i].result.goalsAwayTeam;
                                                    awayGames += 1;
                                                }
                                            }
                                            $scope.averageGoalsAway = countGoalsAway / data.count;
                                            $scope.averageGoalsAwayInAway = countGoalsAwayInAway / awayGames;


                                            // Head2Head fixtures
                                            $.ajax({
                                                headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                                                url: match, dataType: 'json', type: 'GET',
                                            }).done(function (data) {
                                                $scope.Head2HeadHomeTeamWinsPercent = data.head2head.homeTeamWins / data.head2head.count;
                                                $scope.Head2HeadDrawPercent = data.head2head.draws / data.head2head.count;
                                                $scope.Head2HeadAwayTeamWinsPercent = data.head2head.awayTeamWins / data.head2head.count;

                                                console.log('///////////////////////////////////////////////////////////////////////');
                                                console.log(homeTeam + ' - ' + awayTeam);

                                                console.log('--------------------------');
                                                console.log('averageGoalsHome: ' + $scope.averageGoalsHome);
                                                console.log('averageGoalsHomeInHome: ' + $scope.averageGoalsHomeInHome);

                                                console.log('averageGoalsAway: ' + $scope.averageGoalsAway);
                                                console.log('averageGoalsAwayInAway: ' + $scope.averageGoalsAwayInAway);

                                                console.log('Head2HeadHomeTeamWinsPercent: ' + $scope.Head2HeadHomeTeamWinsPercent);
                                                console.log('Head2HeadDrawPercent: ' + $scope.Head2HeadDrawPercent);
                                                console.log('Head2HeadAwayTeamWinsPercent: ' + $scope.Head2HeadAwayTeamWinsPercent);

                                                console.log('homeTeamPositionMultiplyer: ' + $scope.games[index].homeTeamPositionMultiplyer);
                                                console.log('awayTeamPositionMultiplyer: ' + $scope.games[index].awayTeamPositionMultiplyer);

                                                console.log('score1: ' + (($scope.averageGoalsHomeInHome * 0.7) + ($scope.averageGoalsHome * 0.3)) * $scope.games[index].homeTeamPositionMultiplyer);
                                                console.log('score2: ' + (($scope.averageGoalsAwayInAway * 0.7) + ($scope.averageGoalsAway * 0.3)) * $scope.games[index].awayTeamPositionMultiplyer);

                                                $scope.games[index].score1 = Math.round(((($scope.averageGoalsHomeInHome * 0.7) + ($scope.averageGoalsHome * 0.3)) * $scope.games[index].homeTeamPositionMultiplyer));
                                                $scope.games[index].score2 = Math.round(((($scope.averageGoalsAwayInAway * 0.7) + ($scope.averageGoalsAway * 0.3)) * $scope.games[index].awayTeamPositionMultiplyer));

                                                $scope.$apply();
                                            }).error(function (data, status) {
                                                console.log(data, status);
                                            });

                                        }).error(function (data, status) {
                                            console.log(data, status);
                                        });

                                    }).error(function (data, status) {
                                        console.log(data, status);
                                    });

                                }).error(function (data, status) {
                                    console.log(data, status);
                                });

                            }).error(function (data, status) {
                                console.log(data, status);
                            });

                        }).error(function (data, status) {
                            console.log(data, status);
                        });


                    }).error(function (data, status) {
                        console.log(data, status);
                    });


                }).error(function (data, status) {
                    console.log(data, status);
                });
            } else {
                // Home team
                $.ajax({
                    headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                    url: homeTeamLink, dataType: 'json', type: 'GET',
                }).done(function (data) {
                    $scope.games[index].logo1 = data.crestUrl;

                    // Away team
                    $.ajax({
                        headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                        url: awayTeamLink, dataType: 'json', type: 'GET',
                    }).done(function (data) {
                        $scope.games[index].logo2 = data.crestUrl;

                        // Home team players
                        $.ajax({
                            headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                            url: homeTeamLink + '/players', dataType: 'json', type: 'GET',
                        }).done(function (data) {
                            var playersValue = 0;
                            for (var i = 0; i < data.players.length; i++) {
                                playersValue += parseInt(data.players[i].marketValue);
                            }
                            $scope.averagePlayerValueHome = Math.round(playersValue / data.count);

                            // Away team players
                            $.ajax({
                                headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                                url: awayTeamLink + '/players', dataType: 'json', type: 'GET',
                            }).done(function (data) {

                                // Home team fixtures
                                $.ajax({
                                    headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                                    url: homeTeamLink + '/fixtures', dataType: 'json', type: 'GET',
                                }).done(function (data) {
                                    var homeGames = 0;
                                    var countGoalsHome = 0;
                                    var countGoalsHomeInHome = 0;
                                    for (var i = 0; i < data.fixtures.length; i++) {
                                        if (homeTeam == data.fixtures[i].homeTeamName) {
                                            countGoalsHome += data.fixtures[i].result.goalsHomeTeam;
                                            countGoalsHomeInHome += data.fixtures[i].result.goalsHomeTeam;
                                            homeGames += 1;
                                        }
                                        if (homeTeam == data.fixtures[i].awayTeamName) {
                                            countGoalsHome += data.fixtures[i].result.goalsAwayTeam;
                                        }
                                    }
                                    $scope.averageGoalsHome = countGoalsHome / data.count;
                                    $scope.averageGoalsHomeInHome = countGoalsHomeInHome / homeGames;

                                    // Away team fixtures
                                    $.ajax({
                                        headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                                        url: awayTeamLink + '/fixtures', dataType: 'json', type: 'GET',
                                    }).done(function (data) {
                                        var awayGames = 0;
                                        var countGoalsAway = 0;
                                        var countGoalsAwayInAway = 0;
                                        for (var i = 0; i < data.fixtures.length; i++) {
                                            if (awayTeam == data.fixtures[i].homeTeamName) {
                                                countGoalsAway += data.fixtures[i].result.goalsHomeTeam;
                                            }
                                            if (awayTeam == data.fixtures[i].awayTeamName) {
                                                countGoalsAway += data.fixtures[i].result.goalsAwayTeam;
                                                countGoalsAwayInAway += data.fixtures[i].result.goalsAwayTeam;
                                                awayGames += 1;
                                            }
                                        }
                                        $scope.averageGoalsAway = countGoalsAway / data.count;
                                        $scope.averageGoalsAwayInAway = countGoalsAwayInAway / awayGames;


                                        // Head2Head fixtures
                                        $.ajax({
                                            headers: { 'X-Auth-Token': '5b138239e0054f328f7b1b2cba35db75' },
                                            url: match, dataType: 'json', type: 'GET',
                                        }).done(function (data) {
                                            $scope.Head2HeadHomeTeamWinsPercent = data.head2head.homeTeamWins / data.head2head.count;
                                            $scope.Head2HeadDrawPercent = data.head2head.draws / data.head2head.count;
                                            $scope.Head2HeadAwayTeamWinsPercent = data.head2head.awayTeamWins / data.head2head.count;

                                            console.log('///////////////////////////////////////////////////////////////////////');
                                            console.log(homeTeam + ' - ' + awayTeam);

                                            console.log('--------------------------');
                                            console.log('averageGoalsHome: ' + $scope.averageGoalsHome);
                                            console.log('averageGoalsHomeInHome: ' + $scope.averageGoalsHomeInHome);

                                            console.log('averageGoalsAway: ' + $scope.averageGoalsAway);
                                            console.log('averageGoalsAwayInAway: ' + $scope.averageGoalsAwayInAway);

                                            console.log('Head2HeadHomeTeamWinsPercent: ' + $scope.Head2HeadHomeTeamWinsPercent);
                                            console.log('Head2HeadDrawPercent: ' + $scope.Head2HeadDrawPercent);
                                            console.log('Head2HeadAwayTeamWinsPercent: ' + $scope.Head2HeadAwayTeamWinsPercent);

                                            console.log('score1: ' + (($scope.averageGoalsHomeInHome * 0.7) + ($scope.averageGoalsHome * 0.3)));
                                            console.log('score2: ' + (($scope.averageGoalsAwayInAway * 0.7) + ($scope.averageGoalsAway * 0.3)));

                                            $scope.games[index].score1 = Math.round(((($scope.averageGoalsHomeInHome * 0.7) + ($scope.averageGoalsHome * 0.3))));
                                            $scope.games[index].score2 = Math.round(((($scope.averageGoalsAwayInAway * 0.7) + ($scope.averageGoalsAway * 0.3))));

                                            $scope.$apply();
                                        }).error(function (data, status) {
                                            console.log(data, status);
                                        });

                                    }).error(function (data, status) {
                                        console.log(data, status);
                                    });

                                }).error(function (data, status) {
                                    console.log(data, status);
                                });

                            }).error(function (data, status) {
                                console.log(data, status);
                            });

                        }).error(function (data, status) {
                            console.log(data, status);
                        });


                    }).error(function (data, status) {
                        console.log(data, status);
                    });


                }).error(function (data, status) {
                    console.log(data, status);
                });
            }


        }).error(function (data, status) {
            console.log(data, status);
        });
    }

});